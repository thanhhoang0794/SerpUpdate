import { format,isValid, parseISO } from 'date-fns'

export const formatHistoryDate = (dateString: string) => {
  const date = parseISO(dateString)
  return isValid(date) ? format(date, 'MMM dd HH:mm').toUpperCase() : dateString
}

export const formatHistoryDateForDrawer = (dateString: string) => {
  const date = parseISO(dateString)
  return isValid(date) ? format(date, 'HH:mm dd MMMM yyyy') : dateString
}


