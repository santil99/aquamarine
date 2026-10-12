import { SalesService } from "@/application/services/salesService";
import { activeBusiness } from "@/infrastructure/business/mockBusinessContext";
import { supabaseAuthRepository } from "@/infrastructure/supabase/supabaseAuthRepository";
import { supabaseSalesRepository } from "@/infrastructure/supabase/supabaseSalesRepository";
import { SalesListView } from "@/presentation/views/SalesListView";

const salesService = new SalesService(supabaseSalesRepository, supabaseAuthRepository);

const listSales = () => salesService.listToday(activeBusiness);

export function SalesListRoute() {
  return <SalesListView listSales={listSales} />;
}
