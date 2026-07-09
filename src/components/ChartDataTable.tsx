/**
 * Alternativa textual de un gráfico: una tabla real, oculta visualmente pero
 * disponible para lectores de pantalla. El SVG del gráfico se marca como
 * `aria-hidden` porque su contenido no es navegable ni comprensible sin vista.
 */
export function ChartDataTable({
  caption,
  columns,
  rows,
}: {
  caption: string
  columns: string[]
  rows: (string | number)[][]
}) {
  return (
    <table className="visually-hidden">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c} scope="col">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={String(row[0])}>
            <th scope="row">{row[0]}</th>
            {row.slice(1).map((cell, i) => (
              <td key={columns[i + 1]}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
