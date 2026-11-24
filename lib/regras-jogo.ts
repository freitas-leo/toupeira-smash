export const DURACAO_PARTIDA = 30;

export function calcularPontuacao(acertos: number, erros: number) {
  return Math.max(0, 10 * acertos - 5 * erros);
}
