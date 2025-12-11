  import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  appointments: [],
}

const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    setAppointments: (state, action) => {
      state.appointments = action.payload
    },
    addAppointments: (state, action) => {
      state.appointments.push(action.payload)
    },
    removeAppointment: (state, action) => {
      state.appointments = state.appointments.filter(
        (appointment) => appointment?.id !== action.payload
      )
    },
    updateAppointment: (state, action) => {
      const appointment = state.appointments.find(
        (appointment) => appointment?.id === action.payload.id
      )
      if (appointment) {
        appointment.status = action.payload.status;
      }
    },
  },
})

export const { setAppointments, addAppointments,removeAppointment,updateAppointment } = appointmentsSlice.actions
export default appointmentsSlice.reducer
