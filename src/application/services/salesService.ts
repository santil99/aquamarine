import type { AuthRepository } from "@/application/ports/authRepository";
import type { SalesImageStorage } from "@/application/ports/salesImageStorage";
import type { SalesCatalogs, SalesRepository } from "@/application/ports/salesRepository";
import type { BusinessContext } from "@/domain/business/businessContext";
import { getTodayInTimeZone } from "@/domain/business/businessDay";
import { groupByCategory, type CategoryTotal } from "@/domain/business/categoryTotal";
import { buildDailySalesSeries, type DailySalesPoint } from "@/domain/business/dailySales";
import type { SaleWithImages } from "@/domain/sales/saleDetail";
import {
  normalizeSaleAmount,
  normalizeSaleDetail,
  validateNewSale,
  type NewSaleInput,
  type NewSaleValidationErrors,
} from "@/domain/sales/newSale";
import {
  buildSaleImagePath,
  validateSaleImages,
  type SaleImageError,
} from "@/domain/sales/saleImages";
import type { SaleListItem } from "@/domain/sales/saleListItem";
import type { SaleSearchFilters, SaleSearchItem } from "@/domain/sales/saleSearch";

export class NewSaleValidationError extends Error {
  readonly errors: NewSaleValidationErrors;

  constructor(errors: NewSaleValidationErrors) {
    super("Invalid new sale");
    this.errors = errors;
  }
}

export class SaleImagesValidationError extends Error {
  readonly error: SaleImageError;

  constructor(error: SaleImageError) {
    super("Invalid sale images");
    this.error = error;
  }
}

export class SalesService {
  private readonly salesRepository: SalesRepository;
  private readonly authRepository: AuthRepository;
  private readonly imageStorage: SalesImageStorage;

  constructor(
    salesRepository: SalesRepository,
    authRepository: AuthRepository,
    imageStorage: SalesImageStorage,
  ) {
    this.salesRepository = salesRepository;
    this.authRepository = authRepository;
    this.imageStorage = imageStorage;
  }

  async listForDate(business: BusinessContext, date: string): Promise<SaleListItem[]> {
    await this.requireAuthenticatedUser();

    return this.salesRepository.listForDate(business, date);
  }

  async searchSales(
    business: BusinessContext,
    filters: SaleSearchFilters,
  ): Promise<SaleSearchItem[]> {
    await this.requireAuthenticatedUser();

    return this.salesRepository.search(business, {
      ...filters,
      minAmount: filters.minAmount ? normalizeSaleAmount(filters.minAmount) : null,
      maxAmount: filters.maxAmount ? normalizeSaleAmount(filters.maxAmount) : null,
    });
  }

  async getCategoryTotalsForMonth(
    business: BusinessContext,
    monthStart: string,
  ): Promise<CategoryTotal[]> {
    await this.requireAuthenticatedUser();

    return groupByCategory(
      await this.salesRepository.listAmountsForMonth(business, monthStart),
    );
  }

  async getDailyTotalsForMonth(
    business: BusinessContext,
    monthStart: string,
  ): Promise<DailySalesPoint[]> {
    await this.requireAuthenticatedUser();

    return buildDailySalesSeries(
      await this.salesRepository.listDailyAmountsForMonth(business, monthStart),
      monthStart,
      getTodayInTimeZone(business.timeZone),
    );
  }

  async loadCatalogs(): Promise<SalesCatalogs> {
    await this.requireAuthenticatedUser();

    return this.salesRepository.listCatalogs();
  }

  async registerSale(input: NewSaleInput, transactionDate: string, newImages: Blob[]): Promise<void> {
    const user = await this.requireAuthenticatedUser();
    const errors = validateNewSale(input);

    if (Object.keys(errors).length > 0) {
      throw new NewSaleValidationError(errors);
    }

    this.requireValidImages(newImages);
    const imagePaths = await this.uploadImages(newImages);

    try {
      await this.salesRepository.create({
        userId: user.id,
        amount: normalizeSaleAmount(input.amount),
        categoryId: input.categoryId,
        paymentMethodId: input.paymentMethodId,
        detail: normalizeSaleDetail(input.detail),
        transactionDate,
        imagePaths,
      });
    } catch (error) {
      await this.removeImagesQuietly(imagePaths);
      throw error;
    }
  }

  async getSale(id: string): Promise<SaleWithImages | null> {
    await this.requireAuthenticatedUser();
    const sale = await this.salesRepository.getById(id);

    if (!sale) return null;

    const urls = await this.imageStorage.createSignedUrls(sale.imagePaths);

    return {
      ...sale,
      images: sale.imagePaths.map((path) => ({ path, url: urls[path] })),
    };
  }

  /**
   * `keptPaths` are the stored images the user kept; any other stored image of the sale is removed.
   */
  async updateSale(
    id: string,
    input: NewSaleInput,
    keptPaths: string[],
    newImages: Blob[],
  ): Promise<void> {
    await this.requireAuthenticatedUser();
    const errors = validateNewSale(input);

    if (Object.keys(errors).length > 0) {
      throw new NewSaleValidationError(errors);
    }

    this.requireValidImages(newImages, keptPaths.length);

    const current = await this.salesRepository.getById(id);
    if (!current) throw new Error("Sale not found");

    const removedPaths = current.imagePaths.filter((path) => !keptPaths.includes(path));
    const uploadedPaths = await this.uploadImages(newImages);

    try {
      await this.salesRepository.update(id, {
        amount: normalizeSaleAmount(input.amount),
        categoryId: input.categoryId,
        paymentMethodId: input.paymentMethodId,
        detail: normalizeSaleDetail(input.detail),
        imagePaths: [...keptPaths, ...uploadedPaths],
      });
    } catch (error) {
      await this.removeImagesQuietly(uploadedPaths);
      throw error;
    }

    await this.removeImagesQuietly(removedPaths);
  }

  async deleteSale(id: string): Promise<void> {
    await this.requireAuthenticatedUser();
    const sale = await this.salesRepository.getById(id);

    await this.salesRepository.delete(id);

    if (sale) {
      await this.removeImagesQuietly(sale.imagePaths);
    }
  }

  private requireValidImages(images: Blob[], keptCount = 0): void {
    const error = validateSaleImages(images, keptCount);

    if (error) {
      throw new SaleImagesValidationError(error);
    }
  }

  /** Uploads all images or none: already uploaded objects are removed if a later upload fails. */
  private async uploadImages(images: Blob[]): Promise<string[]> {
    const paths: string[] = [];

    try {
      for (const image of images) {
        const path = buildSaleImagePath(image.type, crypto.randomUUID(), Date.now());
        await this.imageStorage.upload(path, image, image.type);
        paths.push(path);
      }

      return paths;
    } catch (error) {
      await this.removeImagesQuietly(paths);
      throw error;
    }
  }

  /** Storage cleanup must not fail the operation that already succeeded; leftovers are logged. */
  private async removeImagesQuietly(paths: string[]): Promise<void> {
    if (paths.length === 0) return;

    try {
      await this.imageStorage.remove(paths);
    } catch (error) {
      console.error("Could not remove sale images", paths, error);
    }
  }

  private async requireAuthenticatedUser() {
    const user = await this.authRepository.getCurrentUser();

    if (!user) {
      throw new Error("Authenticated user required");
    }

    return user;
  }
}