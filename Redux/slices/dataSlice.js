import { createSlice } from '@reduxjs/toolkit';
import {
  deleteUser,
  Announcements,
  requestOtp,
  verifyOtp,
  eligiblePickup
} from '../actions/dataActions';



const initialState = {
  requestOtpData:null,
  verifyOtpData:null,
  allListResponse: null,
  chooseOneResponse: null,
  deleteUserResponse: null,
  tenantsResponse: null,
  announcementsData: null,
  ReadAnnouncementsData: null,
  StudentListData: null,
  ClassListData: null,
  SubjectListData: null,
  SumbitAttendanceData: null,
  ViewAttendanceDateData: null,
  ViewAttendanceMonthData: null,
  StudyMaterialData: null,
  eligiblePickupData:null
};



const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setSearchKey: (state, action) => {
      state.searchkey = action.payload;
    },
    setHeaderOpen: (state, action) => {
      state.headerOpen = action.payload;
    },
      setClearRequestOtpRedux: (state, action) => {
      state.requestOtpData = null
    },
    setClearVerifyOtpRedux:(state,action) => {
      state.verifyOtpData =null
    },
    setClearReadAnnoucementRedux: (state, action) => {
      state.ReadAnnouncementsData = null
    },
    setClearStudentListRedux: (state, action) => {
      state.StudentListData = null
    },
    setClearClassListRedux: (state, action) => {
      state.ClassListData = null
    },
    setClearSumbitAttendanceRedux: (state, action) => {
      state.SumbitAttendanceData = null
    },
    setClearViewAttendanceDateData: (state, action) => {
      state.ViewAttendanceDateData = null
    },
    setClearViewAttendanceMonthData: (state, action) => {
      state.ViewAttendanceMonthData = null
    },
    setClearVerifyOtpData: (state, action) => {
      state.verifyOtpData = null
    },
    
    
  },

  extraReducers: (builder) => {
    builder
     .addCase(requestOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.requestOtpData = action.payload;
      })
      .addCase(requestOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
     .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.verifyOtpData = action.payload;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.deleteUserResponse = action.payload;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(eligiblePickup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(eligiblePickup.fulfilled, (state, action) => {
        state.loading = false;
        state.eligiblePickupData = action.payload;
      })
      .addCase(eligiblePickup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
  },

});



export const { setSearchKey, setHeaderOpen, setClearLeadListRedux, setClearReadAnnoucementRedux, setClearStudentListRedux, setClearClassListRedux, setClearSumbitAttendanceRedux, setClearViewAttendanceDateData, setClearViewAttendanceMonthData,setClearRequestOtpRedux,setClearVerifyOtpData } = dataSlice.actions;
export default dataSlice.reducer;