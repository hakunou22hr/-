/** Line breaks only: mathematical content is shared with the preserved lesson. */
export const instagramFormulas = {
  productGeneral: String.raw`\begin{gathered}\sin\alpha\cos\beta=\\[0.25em]\frac12\{\sin(\alpha+\beta)+\sin(\alpha-\beta)\}\end{gathered}`,
  product: String.raw`\begin{gathered}\sin3x\cos x=\\[0.25em]\frac12(\color{#e6c580}{\sin4x}+\color{#78d9ff}{\sin2x})\end{gathered}`,
  factor2: String.raw`\begin{gathered}\frac12\times\left(-\frac14\right)=-\frac18\\[0.3em]\frac12\times\left(-\frac12\right)=-\frac14\end{gathered}`,
} as const;
