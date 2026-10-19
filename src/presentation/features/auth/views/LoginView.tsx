import { useState, type SyntheticEvent } from "react";
import { Button, FieldError, Form, Input, Label, TextField } from "@heroui/react";
import { AuthCredentialsError } from "@/application/ports/authRepository";
import {
  hasLoginFieldErrors,
  validateLoginFields,
  type LoginFieldError,
  type LoginFieldErrors,
} from "@/domain/auth/loginFields";
import { useTexts } from "@/presentation/texts/useTexts";

interface LoginViewProps {
  readonly signIn: (email: string, password: string) => Promise<void>;
  readonly onSignedIn: () => void;
}

export function LoginView({ signIn, onSignedIn }: LoginViewProps) {
  const { login: texts } = useTexts();
  const fieldErrorMessages: Record<LoginFieldError, string> = {
    emailRequired: texts.emailRequired,
    emailInvalid: texts.emailInvalid,
    passwordRequired: texts.passwordRequired,
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const errors = validateLoginFields(email, password);
    setFieldErrors(errors);
    setSubmitError(null);

    if (hasLoginFieldErrors(errors)) return;

    setIsSubmitting(true);

    try {
      await signIn(email.trim(), password);
      onSignedIn();
    } catch (error) {
      setSubmitError(error instanceof AuthCredentialsError ? texts.invalidCredentials : texts.connectionError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <section className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="text-center text-2xl font-bold">{texts.title}</h1>

        <Form onSubmit={handleSubmit} validationBehavior="aria" className="flex w-full flex-col gap-4">
          <TextField
            name="email"
            type="email"
            autoComplete="email"
            isInvalid={Boolean(fieldErrors.email)}
            value={email}
            onChange={setEmail}
            className="w-full"
          >
            <Label>{texts.identifierLabel}</Label>
            <Input />
            {fieldErrors.email ? <FieldError>{fieldErrorMessages[fieldErrors.email]}</FieldError> : null}
          </TextField>

          <TextField
            name="password"
            type="password"
            autoComplete="current-password"
            isInvalid={Boolean(fieldErrors.password)}
            value={password}
            onChange={setPassword}
            className="w-full"
          >
            <Label>{texts.passwordLabel}</Label>
            <Input />
            {fieldErrors.password ? <FieldError>{fieldErrorMessages[fieldErrors.password]}</FieldError> : null}
          </TextField>

          {submitError ? (
            <p role="alert" className="text-sm text-danger">
              {submitError}
            </p>
          ) : null}

          <Button type="submit" isDisabled={isSubmitting} className="w-full">
            {isSubmitting ? texts.submitting : texts.submit}
          </Button>
        </Form>
      </section>
    </main>
  );
}
