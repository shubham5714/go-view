import { HistoryTargetTypeEnum, HistoryActionTypeEnum } from './chartHistoryStore.d'

export const historyActionTypeName = {
  [HistoryActionTypeEnum.ADD]: 'Add',
  [HistoryActionTypeEnum.DELETE]: 'Delete',
  [HistoryActionTypeEnum.UPDATE]: 'Update',
  [HistoryActionTypeEnum.MOVE]: 'Move',
  [HistoryActionTypeEnum.PASTE]: 'Paste',
  [HistoryActionTypeEnum.COPY]: 'Copy',
  [HistoryActionTypeEnum.CUT]: 'Cut',
  [HistoryActionTypeEnum.TOP]: 'To top',
  [HistoryActionTypeEnum.BOTTOM]: 'To bottom',
  [HistoryActionTypeEnum.UP]: 'Move up',
  [HistoryActionTypeEnum.DOWN]: 'Move down',
  [HistoryActionTypeEnum.GROUP]: 'Group',
  [HistoryActionTypeEnum.UN_GROUP]: 'Ungroup',
  [HistoryActionTypeEnum.LOCK]: 'Lock',
  [HistoryActionTypeEnum.UNLOCK]: 'Unlock',
  [HistoryActionTypeEnum.HIDE]: 'Hide',
  [HistoryActionTypeEnum.SHOW]: 'Show',

  [HistoryTargetTypeEnum.CANVAS]: 'Canvas init'
}
