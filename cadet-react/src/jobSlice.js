import { createSlice } from '@reduxjs/toolkit'

export const jobSlice = createSlice({
  name: 'job',
  initialState: {
    quals: "",
    jobTitle: "Principal Data Scientist",
    companyName: "Chunky Funky Monkey",
    companyDescription: "Chunky Funky Monkey is an online d2c brand serving delicious chunky cookies to customers around the world",
    teamName: "Customer Success",
    teamDescription: "The Customer Success Team takes a data-driven approach to ensuring our customers have a seamless end-to-end customer journey from onboarding to purchase"
  },
  reducers: {
    setQuals: (state, action) => {
        state.quals = action.payload
    },
    resetQuals: (state) => {
        state.quals = ""
    },
    setJobTitleRedux: (state, action) => {
      state.jobTitle = action.payload
    },
    setCompanyNameRedux: (state, action) => {
      state.companyName = action.payload
    },
    setCompanyDescriptionRedux: (state, action) => {
      state.companyDescription = action.payload
    },
    setTeamNameRedux: (state, action) => {
      state.teamName = action.payload
    },
    setTeamDescriptionRedux: (state, action) => {
      state.teamDescription = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const { setQuals, resetQuals, setJobTitleRedux, setCompanyNameRedux, setCompanyDescriptionRedux, setTeamNameRedux, setTeamDescriptionRedux } = jobSlice.actions

export default jobSlice.reducer