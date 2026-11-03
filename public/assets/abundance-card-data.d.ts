export interface AbundanceCard { id: string; name: string; message: string; action: string; }
export const abundanceCards: AbundanceCard[];
export function shuffleDeck<T>(cards: readonly T[], random?: () => number): T[];