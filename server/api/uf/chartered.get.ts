import { parse } from "node-html-parser"
import { CHARTERED_LINE, SA_CHARTERED_END, SA_CHARTERED_LEAVE, SA_TERMINAL_STOP, SBC_CHARTERED_END, SBC_CHARTERED_LEAVE, SBC_TERMINAL_STOP } from "~/server/utils/chartered";
import type { Chartered, UFCharteredLines } from "~/common/types";

export default defineEventHandler(async (event) => {
  const { UF_CHARTERED } = useRuntimeConfig()
  const charteredHTMLPage = await $fetch<string>(UF_CHARTERED)
  const page = parse(charteredHTMLPage);
  const [, title] = page.querySelectorAll('h1')
  const weekdayItinerary = page.querySelector('#tabela-horarios')
  const itineraryHeader = weekdayItinerary?.querySelector('thead > tr')
  const itinerary = weekdayItinerary?.querySelector('tbody')

  if (!itineraryHeader || !itinerary) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not get itinerary'
    })
  }

  const headers = Array.from(itineraryHeader?.querySelectorAll('th'))
  const rows = Array.from(itinerary?.querySelectorAll('tr'))

  const result = {} as Chartered;
  for (const row of rows) {
    const cells = Array.from(row.querySelectorAll('td'))
    let linha = '' as UFCharteredLines;
    let santoAndrePartida = '' as `${string}:${string}`;
    let santoAndreChegada = '' as `${string}:${string}`;
    let saoBernardoPartida = '' as `${string}:${string}`;
    let saoBernardoChegada = '' as `${string}:${string}`;
    let saBusStop = '' as `${string}:${string}`
    let sbcBusStop = '' as `${string}:${string}`

    for (const [cellIndex, cell] of cells.entries()) {
      const header = headers[cellIndex];
      const headerText = header ? header.innerText.trim() : 'N/A';
      console.log(headerText)
      switch (cellIndex) {
        case CHARTERED_LINE:
          linha = cell.innerText.trim() as UFCharteredLines;
          if (!result[linha]) {
            result[linha] = {
              sa: [],
              sbc: []
            };
          }
          break;
        case SA_CHARTERED_LEAVE:
          santoAndrePartida = cell.innerText.trim() as `${string}:${string}`;
          break;
        case SA_TERMINAL_STOP:
          saBusStop = cell.innerText.trim() as `${string}:${string}`
          break;
        case SA_CHARTERED_END:
          santoAndreChegada = cell.innerText.trim() as `${string}:${string}`;
          break;
        case SBC_CHARTERED_LEAVE:
          saoBernardoPartida = cell.innerText.trim() as `${string}:${string}`;
          break;
        case SBC_TERMINAL_STOP:
          sbcBusStop = cell.innerText.trim() as `${string}:${string}`
          break;
        case SBC_CHARTERED_END:
          saoBernardoChegada = cell.innerText.trim() as `${string}:${string}`;
          break;
      }
    }

    if (santoAndrePartida && santoAndreChegada) {
      result[linha].sa.push({
        startDate: santoAndrePartida,
        endDate: santoAndreChegada,
        terminalStop: saBusStop,
      });
    }

    if (saoBernardoPartida && saoBernardoChegada) {
      result[linha].sbc.push({
        startDate: saoBernardoPartida,
        endDate: saoBernardoChegada,
        terminalStop: sbcBusStop,
      });
    }
  }

  return {
    title: title.rawText,
    result,
  }
})