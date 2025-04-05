export const BASE_API_URL = 'https://admin.ztrucking.com';
//  export const BASE_API_URL = 'http://192.168.86.22:8000/';

 export const TERMS_OF_USE = 'https://www.ztrucking.com/terms-and-condition'
 export const PRIVACY_POLICY = 'https://www.ztrucking.com/privacy-policy'
 

 export const FMCS_TERMS = 'https://www.ztrucking.com/fmcsa-terms'
 export const E_SIGNATURE = 'https://www.ztrucking.com/e-signature-terms'
 

export const AUTH_TOKEN = `authorization`
export const PROFILE = 'PROFILE'
export const API_PROFILE_URL = `${BASE_API_URL}/d_api/driver_profile/view/`
export const API_PROFILE_UPDATE_URL = `${BASE_API_URL}/d_api/driver_profile/update/`

export const API_USER_URL = `${BASE_API_URL}/api/profile/`
export const API_PERMISSION_URL = `${BASE_API_URL}/api/user_profile/update_permission/`
export const API_DRIVER_PROFILE_URL = `${BASE_API_URL}/api/profile/driver_profile/`
export const API_CHOICE_URL = `${BASE_API_URL}/d_api/choice/`

export const API_AUTH_SIGN_UP = `${BASE_API_URL}/api/user_profile/signup/`
export const API_AUTH_SIGNED_IN = `${BASE_API_URL}/api/user_profile/login/`
export const API_AUTH_SIGNED_OUT = `${BASE_API_URL}/api/user_profile/logout/`

export const API_EMPLOYMENT_APPLICATION = `${BASE_API_URL}/d_api/driver_employment_application/`
export const API_EMPLOYMENT_APPLICATION_SUBMIT_FOR_REVIEW_URL = `${BASE_API_URL}/d_api/driver_employment_application/submit_for_review/`

export const API_PAYMENT_HISTORY_URL = `${BASE_API_URL}/d_api/driver_profile_payment_history/`
export const API_DRIVER_APP_UPLOAD_URL = `${BASE_API_URL}/d_api/driver_upload_data/`
export const API_PAYCHECK_URL = `${BASE_API_URL}/d_api/paycheck/`
export const API_MAINTENANCE_HISTORY_URL = `${BASE_API_URL}/d_api/maintenance_history/`
export const API_MAINTENANCE_SCHEDULE_URL = `${BASE_API_URL}/d_api/maintenance_schedule/`



export function getDriverAppUploadUrl (props) {
   return `${API_DRIVER_APP_UPLOAD_URL}`
}
export function getEmploymentApplication (props) {
   if (!!props.driver_profile_emp_application)
   return `${API_EMPLOYMENT_APPLICATION}${props.driver_profile_emp_application.id}`
}

export function getEmploymentApplicationSubmitForReviewUrl (props) {
   if (!!props.driver_profile_emp_application)
   return `${API_EMPLOYMENT_APPLICATION_SUBMIT_FOR_REVIEW_URL}${props.driver_profile_emp_application.id}`
}


export function getDriverProfileUrl (props, method='GET') {

   if (method == 'GET') {
      return `${API_PROFILE_URL}${props.userId}`
   }
   return `${API_PROFILE_UPDATE_URL}${props.userId}`
}

export function getPayCheckUrl (props) {
   return `${API_PAYCHECK_URL}`
}

export function getMaintenanceHistoryUrl (props) {
   return `${API_MAINTENANCE_HISTORY_URL}`
}

export function getMaintenanceScheduleUrl (props) {
   return `${API_MAINTENANCE_SCHEDULE_URL}`
}
// TODO (Estifanos) updat url
export function getPaymentHistoryUrl (props) {
   return API_PAYMENT_HISTORY_URL
}


export function isValidSubscription (props) {
   // return true
   if (props.subscription && props.subscription.subscriptionStatus == 'VALID') return true
   return false
}
export const DATETIME_FORMAT1 = '%Y-%m-%dT%H:%M:%S.%fZ'
export const DATETIME_FORMAT = 'YYYY-MM-DDThh:mm:ssZ'
export const DATETIME_FORMAT2 = '%Y-%m-%dT%H:%M:%ssZ'
export const DATETIME_FORMAT3 = 'YYYY-MM-DD HH:mm:ss'

export const DATET_FORMAT = 'YYYY-MM-DD'


export const DEAFULT_API_PAGE = 1
export const DEAFULT_API_PAGE_SIZE = 5

export const PROFILE_DATA_REFRESH_INTERVAL = 1800000 // 1 second == 1000 ~ 30 min
export const PROFILE_DATA_REFRESH_SUBSCRIPTION_INTERVAL = 5000 // 1 second == 1000 ~ 30 min

export const APPLE_PAYMENT_SOURCE = "APPLE"
export const ANDROID_PAYMENT_SOURCE = "ANDROID"
export const DEFAULT_PROFILE_PAYMENT = 12.99 // TODO ESTIFANOS This needs to be part of the driver's profile information.