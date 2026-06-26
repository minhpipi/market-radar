// businessQuestions.ts

export enum BusinessQuestion {
  PURCHASE_DRIVERS = "PURCHASE_DRIVERS",
  REVENUE_BARRIERS = "REVENUE_BARRIERS",
  FEAR_MAP = "FEAR_MAP",
  TRUST_SIGNALS = "TRUST_SIGNALS",
  SWITCHING_DRIVERS = "SWITCHING_DRIVERS",
}

export const BUSINESS_QUESTION_LABELS = {
  [BusinessQuestion.PURCHASE_DRIVERS]:
    "Điều gì thúc đẩy quyết định mua?",

  [BusinessQuestion.REVENUE_BARRIERS]:
    "Điều gì làm mất đơn hàng?",

  [BusinessQuestion.FEAR_MAP]:
    "Khách hàng đang sợ điều gì?",

  [BusinessQuestion.TRUST_SIGNALS]:
    "Điều gì tạo niềm tin?",

  [BusinessQuestion.SWITCHING_DRIVERS]:
    "Điều gì khiến khách đổi nhà cung cấp?",
}