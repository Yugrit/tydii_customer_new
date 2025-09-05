import { createAsyncThunk } from '@reduxjs/toolkit'
import { ENDPOINTS } from '../../constants/ApiEndPoints'
import ApiService from '../../services/ApiService'

//request otp

export const requestOtp = createAsyncThunk('data/requestOtp', async body => {
  const response = await ApiService.post({
    url: `${ENDPOINTS.requestOtp}`,
    data: body
  })
  console.log('Response', response)
  if (response) {
    console.log(response, body, 'requestOtp')
    return response
  }
})

// verify otp
export const verifyOtp = createAsyncThunk('data/verifyOtp', async body => {
  const response = await ApiService.post({
    url: `${ENDPOINTS.verifyOtp}`,
    data: body
  })
  console.log('Response', response)
  if (response) {
    console.log(response, body, 'requestOtp')
    return response
  }
})

//Announcement Detail
export const ReadAnnouncements = createAsyncThunk(
  'data/ReadAnnouncements',
  async body => {
    try {
      const response = await ApiService.post({
        url: `${ENDPOINTS.ReadAnnouncements}`,
        data: body
      })
      console.log('Response', response)
      if (response) {
        console.log(response, 'responseAcouncement')
        return response
      }
    } catch (err) {
      console.log('err', err)
    }
  }
)
//get all Attendance Class List(Attendance module for Teacher)
export const ClassList = createAsyncThunk('data/ClassList', async params => {
  const response = await ApiService.get({
    url: `${ENDPOINTS.ClassList}${params}`
  })
  console.log('ClassList', response, params)
  if (response) {
    console.log(response, 'ClassList')
    return response
  }
})

//get all Attendance Class List(Attendance module for Teacher)
export const eligiblePickup = createAsyncThunk(
  'data/eligiblePickup',
  async params => {
    const response = await ApiService.get({
      url: `${ENDPOINTS.eligiblePickup}${params}`
    })
    console.log('eligiblePickup', response, params)
    try {
      console.log('response', response)
      return response
    } catch (error) {
      console.log('errr', error)
    }
    {
      console.log(response, 'eligiblePickup')
      return response
    }
  }
)

//get all Attendance Subject List(Attendance module for Teacher
export const SubjectList = createAsyncThunk(
  'data/SubjectList',
  async params => {
    const response = await ApiService.get({
      url: `${ENDPOINTS.SubjectList}${params}`
    })
    console.log('SubjectList', response, params)
    if (response) {
      console.log(response, 'SubjectList')
      return response
    }
  }
)

//get all Attendance Class List(Attendance module for Teacher)
export const StudentList = createAsyncThunk(
  'data/StudentList',
  async params => {
    const response = await ApiService.get({
      url: `${ENDPOINTS.StudentList}${params}`
    })
    console.log('Response1121212121', response, params)
    if (response) {
      console.log(response, 'StudentList')
      return response
    }
  }
)

//View Attendance of Class (Attendance module for Teacher)
export const SumbitAttendance = createAsyncThunk(
  'data/SumbitAttendance',
  async body => {
    try {
      const response = await ApiService.post({
        url: `${ENDPOINTS.SumbitAttendance}`,
        data: body
      })
      console.log('Response', response)
      if (response) {
        console.log(response, 'SumbitAttendance')
        return response
      }
    } catch (err) {
      console.log('err', err)
    }
  }
)

//View Attendance by date (Attendance module for Teacher)
export const ViewAttendanceDate = createAsyncThunk(
  'data/ViewAttendanceDate',
  async params => {
    const response = await ApiService.get({
      url: `${ENDPOINTS.ViewAttendanceDate}${params}`
    })
    console.log('Response1121212121', response, params)
    if (response) {
      console.log(response, 'ViewAttendanceDate')
      return response
    }
  }
)

// View Attendance by month (Attendance module for Teacher)
export const ViewAttendanceMonth = createAsyncThunk(
  'data/ViewAttendanceMonth',
  async params => {
    const response = await ApiService.get({
      url: `${ENDPOINTS.ViewAttendanceMonth}${params}`
    })
    console.log('Response', response, params)
    if (response) {
      console.log(response, 'ViewAttendanceMonth')
      return response
    }
  }
)

//delete user by id api method
export const deleteUser = createAsyncThunk(
  'data/deleteUser',
  async (id, body) => {
    const response = await ApiService.delete({
      url: `${ENDPOINTS.LOGIN}${id}/`,
      data: body
    })
    if (response) {
      return response
    }
  }
)
