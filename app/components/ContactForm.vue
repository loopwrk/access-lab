<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "@nuxt/ui";

const { t } = useI18n();
const config = useRuntimeConfig();

const emailFormat = z.email();
const schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, t("contact.form.nameError"))
    .max(100, t("contact.form.nameTooLong")),
  email: z
    .string()
    .trim()
    .min(1, t("contact.form.emailRequired"))
    .max(254, t("contact.form.emailTooLong"))
    .refine((value) => emailFormat.safeParse(value).success, t("contact.form.emailInvalid")),
  message: z
    .string()
    .trim()
    .min(1, t("contact.form.messageError"))
    .max(5000, t("contact.form.messageTooLong")),
});

type Schema = z.output<typeof schema>;

const state = reactive<Schema>({ name: "", email: "", message: "" });

const sending = ref(false);
const status = ref<"success" | "error" | null>(null);
const statusMessage = ref("");

async function onSubmit(event: FormSubmitEvent<Schema>) {
  sending.value = true;
  status.value = null;
  try {
    const result = await $fetch<{ success: boolean; message?: string }>(
      "https://api.web3forms.com/submit",
      {
        method: "POST",
        headers: { Accept: "application/json" },
        body: {
          access_key: config.public.web3formsAccessKey,
          name: event.data.name,
          email: event.data.email,
          message: event.data.message,
        },
      },
    );

    if (result.success) {
      status.value = "success";
      statusMessage.value = t("contact.form.success");
      state.name = "";
      state.email = "";
      state.message = "";
    } else {
      status.value = "error";
      statusMessage.value = result.message ?? t("contact.form.error");
    }
  } catch {
    status.value = "error";
    statusMessage.value = t("contact.form.error");
  } finally {
    sending.value = false;
  }
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="flex w-full max-w-lg flex-col gap-5"
    @submit="onSubmit"
  >
    <p class="text-(length:--al-font-size-body) text-(--text-secondary)">
      {{ t("contact.form.allRequired") }}
    </p>

    <UFormField
      :label="t('contact.form.name')"
      name="name"
      required
    >
      <UInput
        v-model="state.name"
        autocomplete="name"
        aria-required="true"
        class="w-full"
      />
    </UFormField>

    <UFormField
      :label="t('contact.form.email')"
      name="email"
      required
    >
      <UInput
        v-model="state.email"
        type="email"
        autocomplete="email"
        aria-required="true"
        class="w-full"
      />
    </UFormField>

    <UFormField
      :label="t('contact.form.message')"
      name="message"
      required
    >
      <UTextarea
        v-model="state.message"
        :rows="5"
        aria-required="true"
        class="w-full"
      />
    </UFormField>

    <UButton
      type="submit"
      color="primary"
      size="lg"
      class="w-fit"
      :loading="sending"
      :disabled="sending"
    >
      {{ t("contact.form.submit") }}
    </UButton>

    <!--
      Persistent live region: it exists before the result arrives, so screen
      readers reliably announce the success / error message when it appears.
    -->
    <div aria-live="polite">
      <div
        v-if="status"
        class="flex items-start gap-2.5 rounded-md border p-3 text-(length:--al-font-size-body)"
        :class="
          status === 'success'
            ? 'border-(--success) bg-(--success-soft) text-(--success)'
            : 'border-(--error) bg-(--error-soft) text-(--error)'
        "
      >
        <UIcon
          :name="status === 'success' ? 'i-lucide-circle-check' : 'i-lucide-circle-alert'"
          class="mt-0.5 size-5 shrink-0"
          aria-hidden="true"
        />
        <span>{{ statusMessage }}</span>
      </div>
    </div>
  </UForm>
</template>
