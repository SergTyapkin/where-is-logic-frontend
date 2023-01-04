import { createRouter, createWebHistory } from 'vue-router'

import ChooseRole from "./views/ChooseRole.vue";
import SeerPage from "./views/SeerPage.vue";
import ChooseTeam from "./views/ChooseTeam.vue";
import Play from "./views/Play.vue";


export default function createVueRouter() {
    const routes = [
        {path: '/role', component: ChooseRole, name: 'chooseRole'},
        {path: '/seer', component: SeerPage, name: 'seerPage'},
        {path: '/teams', component: ChooseTeam, name: 'chooseTeam'},
        {path: '/play', component: Play, name: 'play'},
    ];

    const Router = createRouter({
        history: createWebHistory(),
        routes: routes,
    });

    Router.beforeResolve(async (to) => {
        if (window?.onbeforeunload) {
            if (confirm("Изменения не сохранены. Вы уверены, что хотите покинуть страницу?"))
                window.onbeforeunload = null;
            else
                return false;
        }
    });

    return Router;
}
