import { dictionary } from "./dictionary";
import { marketForces } from "./marketForces";
import { opportunities } from "./opportunities";
import { buyerJourney } from "./buyerJourney";

export function classify(text: string) {

  const lower = text.toLowerCase();

  for (const item of dictionary) {

    if (lower.includes(item.phrase)) {

      const journey =
        buyerJourney[
          item.subtopic as keyof typeof buyerJourney
        ] || null;

      const marketForce =
        marketForces[
          item.subtopic as keyof typeof marketForces
        ] || null;

      const opportunity =
        marketForce
          ? opportunities[
              marketForce as keyof typeof opportunities
            ]
          : null;

      return {
        ...item,
        buyerJourney: journey,
        marketForce,
        opportunity
      };
    }
  }

  return {
    signal: "Unknown",
    topic: "Unknown",
    subtopic: "Unknown",
    buyerJourney: null,
    marketForce: null,
    opportunity: null
  };
}