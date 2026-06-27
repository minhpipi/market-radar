import { BusinessQuestion } from "./businessQuestions"

export const MARKET_FORCE_TO_QUESTIONS = {

  TRUST_BARRIER: [
    BusinessQuestion.TRUST_SIGNALS,
    BusinessQuestion.REVENUE_BARRIERS,
  ],

  FINANCIAL_RISK_BARRIER: [
    BusinessQuestion.REVENUE_BARRIERS,
    BusinessQuestion.FEAR_MAP,
  ],

  QUALITY_BARRIER: [
    BusinessQuestion.FEAR_MAP,
    BusinessQuestion.PURCHASE_DRIVERS,
  ],

  CHOICE_CONFUSION_BARRIER: [
    BusinessQuestion.PURCHASE_DRIVERS,
  ],

  TIME_BARRIER: [
    BusinessQuestion.REVENUE_BARRIERS,
  ],

  AFTER_SALE_BARRIER: [
    BusinessQuestion.TRUST_SIGNALS,
    BusinessQuestion.SWITCHING_DRIVERS,
  ],

  SOCIAL_PROOF_BARRIER: [
    BusinessQuestion.TRUST_SIGNALS,
  ],

  KNOWLEDGE_BARRIER: [
    BusinessQuestion.PURCHASE_DRIVERS,
  ],

}