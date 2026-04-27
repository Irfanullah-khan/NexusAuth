const SibApiV3Sdk = require("sib-api-v3-sdk");

/**
 * getBrevoClient
 * ──────────────
 * Returns a correctly authenticated Brevo API instance using sib-api-v3-sdk.
 *
 * KEY FIX: We create a FRESH ApiClient() per call instead of using
 * SibApiV3Sdk.ApiClient.instance (the global singleton).
 *
 * The global singleton can hold stale or undefined credentials between
 * requests, which causes random 401 errors. A fresh instance guarantees
 * the current BREVO_API_KEY from .env is always used.
 */
const getBrevoClient = () => {
  // ── Validate env variables immediately ─────────────────────────────────────
  if (!process.env.BREVO_API_KEY) {
    throw new Error("[Brevo] BREVO_API_KEY is not set in .env — cannot send emails.");
  }
  if (!process.env.SENDER_EMAIL) {
    throw new Error("[Brevo] SENDER_EMAIL is not set in .env — cannot send emails.");
  }

  // ── Create fresh ApiClient (NOT the global singleton) ─────────────────────
  const freshClient = new SibApiV3Sdk.ApiClient();
  freshClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

  // Pass the fresh client explicitly — TransactionalEmailsApi(apiClient?)
  return new SibApiV3Sdk.TransactionalEmailsApi(freshClient);
};

module.exports = { getBrevoClient, SibApiV3Sdk };