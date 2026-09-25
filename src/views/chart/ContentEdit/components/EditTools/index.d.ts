export enum TypeEnum {
  BUTTON = 'button',
  IMPORTUPLOAD = 'importUpload',
  DROPDOWN = 'dropdown'
}

export type BtnListType = {
  key: string
  type: TypeEnum
  name: string
  icon: any
  handle?: () => void
  options?: { label: string; key: string }[]
  handleSelect?: (key: string) => void
}
