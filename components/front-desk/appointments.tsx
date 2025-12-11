"use client"

import { setAppointments } from "@/store/slices/appointmentSlice";
import { RootState } from "@/store/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import TodayQueue from "./today-queue";

const Appointment = ({ appointments, onRemove }) => {
  const dispatch = useDispatch();
  const storeAppointments = useSelector((state: RootState) => state.appointments.appointments);

  useEffect(() => {
    dispatch(setAppointments(appointments));
  },[appointments, dispatch]);
  
  return <TodayQueue appointments={storeAppointments} onRemove={onRemove} />;
}

export default Appointment;