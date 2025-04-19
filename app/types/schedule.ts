export interface Schedule {
  time: string
  days: {
    MON: boolean
    TUE: boolean
    WED: boolean
    THU: boolean
    FRI: boolean
    SAT: boolean
    SUN: boolean
  }
}
