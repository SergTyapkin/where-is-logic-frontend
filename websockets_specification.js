// Любое сообщение, отправленное через WS, будет содержать два обязательных поля:
const шаблон_сообщения = {
  event: String,
  data: Object,
}

/*
В случае, если сервер или клиент не могут обработать присланное им сообщение
(Например - неизвестное значение поля "event", или не существует одного из обязательных полей "event" или "data"),
он должен отправить сообщение об ошибке, но только единожды подряд. Если
следующее сообщение тоже не удается обработать, сообщение об ошибке отправлять не нужно
(иначе в случе различий поддерживаемых версий спецификации API разными сторонами, может
получиться бесконечная циклическая отправка ошибок).
*/
const шаблон_ошибки = {
  event: "error",
  data: {
    details: String
  }
}


// -------------------------------------
// ------------- Defines ---------------

// ------------- Defines ---------------
// -------------------------------------


// -------------------------------------
// -------- Backend -> Frontend --------
const игрок_поключился = {
  event: "player_connected",
  data: {
    userName: String,
    teamId: Number,
    teamName: String,
  }
}
const игрок_отключился = {
  event: "player_disconnected",
  data: {
    userName: String,
    teamId: Number,
    teamName: String,
  }
}

const команда_дала_ответ = {
  event: "team_answered",
  data: {
    userName: String,
    teamId: Number,
    teamName: String,
  }
}

const число_людей_в_командах = {
  event: "teams_count",
  data: {
    teams: [
      {
        id: Number,
        name: String,
        count: Number,
      },
    ]
  }
}

const команда_которая_отвечает_сейчас = {
  event: "answering_state",
  data: {
    team: null || {
      userName: String,
      teamId: Number,
      teamName: String,
    }
  }
}

const ответ_оценен = {
  event: "answer_rated",
  data: {
    result: Boolean,
    score: Number,
  }
}
// -------- Backend -> Frontend --------
// -------------------------------------


// -------------------------------------
// -------- Frontend -> Backend --------
const подключиться_к_команде = {
  event: "join_to_team",
  data: {
    userName: String,
    teamId: Number,
    teamName: String,
  }
}

const выйти_из_команды = {
  event: "quit_from_team",
  data: {
    userName: String,
    teamId: Number,
    teamName: String,
  }
}

const дать_ответ = {
  event: "answer",
  data: {
    userName: String,
    teamId: Number,
    teamName: String,
  }
}

const оценить_ответ = {
  event: "answer_result",
  data: {
    result: Boolean,
  }
}

const запросить_число_людей_в_командах = {
  event: "get_teams_count",
  data: {}
}

const запросить_команду_которая_отвечает_сейчас = {
  event: "get_answering_state",
  data: {}
}
// -------- Frontend -> Backend --------
// -------------------------------------
