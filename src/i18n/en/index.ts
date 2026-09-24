import login from './login'
import project from './project'

const global = {
  doc_addr: 'Documentation',
  code_addr: 'Repository',
  form_account: 'Please enter your account or email',
  form_password: 'Please enter your password',
  // header
  doc: 'Documentation',
  help: 'Help Center',
  contact: 'About',
  logout: 'Log out',
  logout_success: 'Logged out successfully!',
  logout_failure: 'Logout failed!',
  // system setting
  sys_set: 'System Settings',
  lang_set: 'Language',
  // right key
  r_edit: 'Edit',
  r_preview: 'Preview',
  r_copy: 'Clone',
  r_copy_success: 'Cloned successfully!',
  r_rename: 'Rename',
  r_rename_success: 'Renamed successfully!',
  r_publish: 'Publish',
  r_publish_success: 'Published successfully!',
  r_unpublish: 'Unpublish',
  r_unpublish_success: 'Unpublished successfully!',
  r_download: 'Download',
  r_delete: 'Delete',
  r_delete_success: 'Deleted successfully!',
  r_more: 'More',
}

const http = {
  error_message: 'Failed to fetch data. Please try again later!',
  token_overdue_message: 'Session expired. Please log in again!'
}

export default {
  global,
  http,
  login,
  project
}
