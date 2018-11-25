import {API} from '../../services/services.api'

export const GET_USER_GROUPS = {
    Load: 'groups/USER_GROUPS_LOAD',
    Loaded: 'groups/USER_GROUPS_LOADED',
    Errors: 'groups/USER_GROUPS_ERRORS'
}
export const ADD_GROUP_IN_CLEAN_QUE = {
    click: 'ADD_GROUP_IN_CLEAN_QUE_CLICK',
    added: 'ADD_GROUP_IN_CLEAN_QUE_ADD_TO_SERVER'
}
export const GET_DOGS_COUNT = 'GET_DOGS_COUNT '

export const DELETE_GROUP_FROM_CLEAN_QUE = 'DELETE_GROUP_FROM_CLEAN_QUE'

export const GET_GROUPS_FOR_CLEAN = {
    Load: 'groups/GET_GROUPS_FOR_CLEAN_LOAD',
    Loaded: 'groups/GET_GROUPS_FOR_CLEAN_LOADED',
    Errors: 'groups/GET_GROUPS_FOR_CLEAN_ERRORS'
}

export const SET_CLEANING_STATE_BY_ID = 'SET_CLEANING_STATE_BY_ID'

const initialState = {
    groups: {
        data: [],
        loadingUserGroups: true,
        loadingCleanTasks: true,
        errors: []
    }
}

export default (state = initialState, action) => {
    switch (action.type) {
        case GET_GROUPS_FOR_CLEAN.Load: {
            console.log('Start Load clean tasks')
            return {
                ...state,
                groups: {
                    ...state.groups,
                    loadingCleanTasks: true
                }
            }
        }
        case GET_GROUPS_FOR_CLEAN.Loaded: {
            const groupsForClean = action.payload
            groupsForClean.forEach((group) => {
                group.inCleanQue = true
                group.isLoadingInfo = false
            })
            console.log('Stop Loading clean tasks', groupsForClean)
            return {
                ...state,
                groups: {
                    ...state.groups,
                    data: groupsForClean,
                    loadingCleanTasks: false
                }
            }
        }
        case GET_USER_GROUPS.Load: {
            console.log('Start Load User Groups')
            return {
                ...state,
                groups: {
                    ...state.groups,
                    loadingUserGroups: true
                }
            }
        }
        case GET_USER_GROUPS.Loaded: {
            const userGroups = action.payload
            const groupsSetted = state.groups.data
            userGroups.forEach((group) => {
                group.inCleanQue = false
                group.isLoadingInfo = true
            })
            userGroups.forEach((userGroup) => {
                groupsSetted.forEach((settedGroup) => {
                    if (userGroup.id === settedGroup.vk_id) {
                        userGroup.inCleanQue = settedGroup.inCleanQue
                        userGroup.backEndID = settedGroup.id
                        userGroup.dogs = settedGroup.dogs
                        userGroup.followers = settedGroup.followers
                    }
                })
            })
            console.log('End Load User Groups', userGroups)
            return {
                ...state,
                groups: {
                    data: userGroups,
                    loadingUserGroups: false
                }
            }
        }
        case ADD_GROUP_IN_CLEAN_QUE.click:
            const groupID = action.payload
            let toggledGroups = state.groups.data.map((group) => {
                if (group.id === groupID) {
                    return {
                        ...group,
                        inCleanQue: true
                    }
                } else {
                    return group
                }
            })
            return {
                ...state,
                groups: {
                    ...state.groups,
                    data: toggledGroups
                }
            }
        case ADD_GROUP_IN_CLEAN_QUE.added: {
            const {groupData, groupID} = action.payload
            console.log('GET GROUP DATA:', groupData)
            let groupWithData = state.groups.data.map((group) => {
                if (group.id === groupID) {
                    return {
                        ...group,
                        ...groupData,
                        dogs: 'Анализ...',
                        backEndID: groupData.id
                    }
                } else {
                    return group
                }
            })
            console.log('GROUP WITH DATA:', groupWithData)
            return {
                ...state,
                groups: {
                    ...state.groups,
                    data: groupWithData
                }
            }
        }
        case GET_DOGS_COUNT: {
            const {dogsCount, groupID} = action.payload
            let groupWithDogs = state.groups.data.map((group) => {
                if (group.vk_id === groupID) {
                    return {
                        ...group,
                        dogs: dogsCount
                    }
                } else {
                    return group
                }
            })
            console.log('SET THE DOGS:', groupWithDogs)
            return {
                ...state,
                groups: {
                    ...state.groups,
                    data: groupWithDogs
                }
            }
        }
        case DELETE_GROUP_FROM_CLEAN_QUE: {
            const groupID = action.payload
            let toggledGroups = state.groups.data.map((group) => {
                if (group.id === groupID) {
                    return {...group, inCleanQue: false}
                } else {
                    return group
                }
            })
            console.log('DELETE GROUP:', toggledGroups)
            return {...state, groups: {...state.groups, data: toggledGroups}}
        }
        case SET_CLEANING_STATE_BY_ID: {
            let groupID = action.payload
            let withCleanTask = state.groups.data.map((group) => {
                console.log('COMPARE:', group, groupID)
                if (group.backEndID === groupID) {
                    return {
                        ...group,
                        cleanData: {
                            isCleaning: true,
                            progress: 0,
                            status: 'Отправляем запрос'
                        }
                    }
                } else {
                    return group
                }
            })
            return {
                ...state,
                groups: {
                    ...state.groups,
                    data: withCleanTask
                }
            }
        }
        default:
            return state
    }
}

export const AddGroupInCleanQue = (groupID) => {
    return (dispatch) => {
        dispatch({
            type: ADD_GROUP_IN_CLEAN_QUE.click,
            payload: groupID
        })
        API.addGroupToCleanAndGetItData(groupID).then((r) => {
            const groupData = r.data
            console.log('ADD GROUP TO CLEAN QUE:', groupData)
            dispatch({
                type: ADD_GROUP_IN_CLEAN_QUE.added,
                payload: {groupData, groupID}
            })
            API.getGroupDogsCount(groupData.id).then((r) => {
                console.log('DOGS COUNT:', r.data)
                const dogsCount = r.data.dogs_count
                dispatch({
                    type: GET_DOGS_COUNT,
                    payload: {dogsCount, groupID}
                })
            })
        })
    }
}

export const setCleaningStateOnGroupByID = (groupID) => {
    return (dispatch) => {
        dispatch({
            type: SET_CLEANING_STATE_BY_ID,
            payload: groupID
        })
    }
}

export const DeleteGroupFromCleanQue = (groupID, backEndID) => {
    return (dispatch) => {
        dispatch({
            type: DELETE_GROUP_FROM_CLEAN_QUE,
            payload: groupID
        })
        API.deleteGroupFromCleanQue(backEndID).then((r) => {
            console.log('DELETED GROUP:', r.data)
        })
    }
}
export const ToggleIsGroupForCleaning = (groupID, inCleanQue) => {
    console.log('TOGGLE GROUP:', groupID, inCleanQue)
    return (dispatch) => {
        if (!inCleanQue) {
            API.addGroupToCleanAndGetItData(groupID).then((r) => {
                const id = r.data.id
                console.log('ADD PUBLICK TO CLEAN QUE:', r.data)
                API.getGroupDogsCount(id).then((r) => {
                    console.log('DOGS COUNT:', r.data)
                })
            })
        }
        dispatch({
            type: ADD_GROUP_IN_CLEAN_QUE,
            payload: groupID
        })
    }
}

export const GetGroupsForCleanAndUserGroups = () => {
    return (dispatch) => {
        startLoading(GET_GROUPS_FOR_CLEAN, dispatch)
        API.getGroupsForClean().then((r) => {
            const groupsForClean = r.data
            dispatch({
                type: GET_GROUPS_FOR_CLEAN.Loaded,
                payload: groupsForClean
            })
            startLoading(GET_USER_GROUPS, dispatch)
            const groups = API.getUserGroups()
            groups.then((res) => {
                dispatch({type: GET_USER_GROUPS.Loaded, payload: res})
            })
        })
    }
}

const startLoading = (loadingProperty, dispatch) => {
    dispatch({
        type: loadingProperty.Load
    })
}
