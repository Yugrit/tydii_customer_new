import { Dimensions } from 'react-native'
export const WIDTH = Dimensions.get('screen').width
export const HEIGHT = Dimensions.get('screen').height

export const PLATFORM = {
  ANDROID: 'android',
  IOS: 'ios'
}

export const PROVIDER = {
  PLAY_STORE: 'playStore',
  APP_STORE: 'appStore'
}

export const IMAGES = {}

export const URLs = {
  BASE_URL: 'https://dev.tydii.io/api/'
}

export const METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
}

export const HEADERS = {
  MULTIPART_FORMDATA: 'multipart/form-data',
  APPLICATION_JSON: 'application/json'
}

export const STATIC_TEXT = {
  INVALID_FORM: 'Fill the form appropriately.',
  ERROR_FETCHING: 'Error fetching data.',
  INVALID_EMAIL_PATTERN: 'Invalid email address',
  PASSWORD_NOT_MATCHED: "Password doesn't match",
  REQUIRED_FIRST_NAME: 'First name is required field',
  REQUIRED_LAST_NAME: 'Last name is required field',
  REQUIRED_EMAIL: 'Email is required field',
  DELETED_SUCCESSFULLY: 'Deleted successfully.',
  INCORRECT_PASSWORD: 'Incorrect password',
  REQUIRED_PASSWORD: 'Password is required field',
  ALL_FIELDS_MANDATORY: 'All fields are mandatory',
  ACCEPT_TERMS_N_CONDITION: 'Please accept the terms & condition',
  ENTER_EMAIL_N_PASSWORD: 'Please enter email and password',
  ENTER_NEW_N_CONFIRM_PASSWORD:
    'Please enter new password and confirm password',
  ENTER_NEW_PASSWORD: 'Please enter new password',
  ENTER_CONFIRM_PASSWORD: 'Please enter confirm password',
  ENTER_4_DIGIT_CODE: 'Enter your 4 digit verification code',
  INVALID_PASSWORD_PATTERN:
    'The password must contain one uppercase letter, one special character, one numeric character, and be a minimum of 8 characters in length'
}

export const STRINGS = {
  NAME: 'name',
  CONNECTING: 'Connecting',
  CONNECTED: 'Connected',
  DISCONNECTED: 'Disconnected',
  USER_ID: 'userId',
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  LANGUAGE: 'language',
  ROLE: 'role',
  SCHOOL_CYCLE_ID: 'schoolCycleId',
  User_Name: 'userName',
  Language: 'language',
  Class_Id: 'classId'
}

export const SCREENS = {
  MAIN_NAVIGATOR: 'MainNavigator',
  WELCOME_SCREEN: 'WelcomeScreen',
  LOGIN_SCREEN: 'LoginScreen',
  SIGNUP_SCREEN: 'SignUpScreen'
}

export const FONTFAMILY = {
  MEDIUM: 'Poppins-Medium',
  REGULAR: 'Poppins-Regular',
  LIGHT: 'Poppins-Light',
  BOLD: 'Poppins-Bold',
  SEMIBOLD: 'Poppins-SemiBold',
  ITALIC: 'Poppins-Italic'
}

export const APPCOLOR = {
  PRIMARY_WHITE: '#FDFDFD',
  PRIMARY_WHITE_TEXT: '#F3F3F3',
  PRIMARY_BLUE: '#0A4A77',
  PRIMARY_DARK_BLUE: '#002A49',
  PRIMARY_BORDER: '#5C5C5C',
  BLACK: '#000000',
  RED: '#FF4056',
  ORANGE: '#D67C05',
  WHITE: '#fff',
  SUCCESS: '#286F33',
  OFFWHITE: '#F5F5F5',
  GRAY: '#9E9E9E',
  GREEN: '#347831',
  LIGHTBLACK: '#000000',
  GRAYBORDER: '#D6D6D6',
  GRAYBORDER2: '#E2DEDE',
  GRAYTEXT: '#7F7F7F',
  DISABLE: '#585757',
  RED1: '#921111',
  BORDERLINE: '#E5E5E5',
  BOTTOM_INACTIVE: '#8d8d8d'
}
