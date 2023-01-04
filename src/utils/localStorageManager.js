const _PropertyNames = {
  role: 'role',
  userName: 'user-name',
  selectedTeam: 'selected-team',
}


export default class LocalStorageManager {
  // ---- TASKS ----
  saveRole(role) {
    localStorage.setItem(_PropertyNames.role, role);
  }
  loadRole() {
    return localStorage.getItem(_PropertyNames.role);
  }
  removeRole() {
    localStorage.removeRole(_PropertyNames.role);
  }

  // ---- UserName ----
  saveUserName(name) {
    localStorage.setItem(_PropertyNames.userName, name);
  }
  loadUserName() {
    return localStorage.getItem(_PropertyNames.userName);
  }
  removeUserName() {
    localStorage.removeItem(_PropertyNames.userName);
  }

  // ---- selectedTeam ----
  saveSelectedTeam(id) {
    localStorage.setItem(_PropertyNames.selectedTeam, id);
  }
  loadSelectedTeam() {
    return localStorage.getItem(_PropertyNames.selectedTeam);
  }
  removeSelectedTeam() {
    localStorage.removeItem(_PropertyNames.selectedTeam);
  }
}
