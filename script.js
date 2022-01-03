;(function () {
  // *******************************************************************
  // GLOBAL
  // *******************************************************************

  // text
  let inputText = ''
  const setInputText = (val) =>
    (inputText = typeof val == 'function' ? val() : val)

  // todo
  let todos = []
  const setToDos = (val) => (todos = typeof val == 'function' ? val() : val)

  // todoFiltered
  let todoFiltered = []
  const setTodoFilterd = (val) =>
    (todoFiltered = typeof val == 'function' ? val() : val)

  // cache & globalId
  const cache = []
  let globalId = 0

  // useEffect
  const useEffect = (callback, dependencies) => {
    const id = globalId
    globalId++
    if (cache[id] == null) {
      cache[id] = { dependencies: undefined }
    }

    const changed =
      dependencies === null ||
      dependencies.some((dependency, i) => {
        return (
          cache[id].dependencies === null ||
          cache[id].dependencies !== dependency
        )
      })
    if (changed) {
      if (cache[id].fn != null) cache[id].fn()
      cache[id].fn = callback()
      cache[id].dependencies = dependencies
    }
  }

  // *******************************************************************
  // COMPONENTS
  // *******************************************************************

  function TodoItem({ todo }) {
    return `
      <div id=${todo.id.toString()} class="todo">
        <li class="todo-item">${todo.text}</li>
        <button ${
          todo.completed == true ? 'style="display: none;"' : ''
        } class="complete-btn"><i class="fas fa-check"></i></button>
        <button class="trash-btn"><i class="fas fa-trash"></i></button>
      </div>
      `
  }

  function TodoList({ todos }) {
    let components = ''
    todos.map((todo) => {
      components += TodoItem({ todo })
    })
    return `
      <div id="todo-container" class="todo-container">
        <ul class="todo-list">${components}</ul>
      </div>
    `
  }

  function Form() {
    return `<form>
      <input id="todo-input" type="text" class="todo-input" />
      <button id="todo-button" class="todo-button" type="submit">
        <i class="fas fa-plus-square  "></i>
      </button>
      <div class="select">
        <select id="filter-todo" name="todos" class="filter-todo" value="uncompleted">
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="uncompleted">Uncompleted</option>
        </select>
      </div>
    </form>`
  }

  // *******************************************************************
  // APPLICATION
  // *******************************************************************

  function App() {
    return `${Form()} ${TodoList({ todos: [] })}`
  }

  // *******************************************************************
  // RENDER
  // *******************************************************************

  function render(props) {
    const frag = document
      .createRange()
      .createContextualFragment(props.frag(props.props))
    const container = document.querySelector(props.container)
    container.appendChild(frag)
    // focus on input every time this function is executed
    document.querySelector('#todo-input').focus()
  }

  render({ frag: App, container: '#todo', todos, props: { todo: [] } })

  // *******************************************************************
  // JAVASCRIPT
  // *******************************************************************

  const removeChilds = (element) => {
    if (element.lastChild) {
      element.lastChild.remove()
      removeChilds(element)
    }
    return null
  }

  const todoFilter = (state) => {
    switch (state) {
      case 'completed':
        setTodoFilterd(todos.filter((todo) => todo.completed == true))
        break
      case 'uncompleted':
        setTodoFilterd(todos.filter((todo) => todo.completed == false))
        break
      default:
        setTodoFilterd(todos.filter((todo) => todo))
        break
    }
  }

  // *****************************************

  const todoInput = document.querySelector('#todo-input')
  const todoButton = document.querySelector('#todo-button')
  const todosContainer = document.querySelector('#todo-container ul')
  const filterTodo = document.querySelector('#filter-todo')

  filterTodo.addEventListener('change', filterTodoHandler)
  todoInput.addEventListener('change', inputTextHandler)
  todoButton.addEventListener('click', submitTodoHandler)
  todosContainer.addEventListener('click', todosManagementHandler)

  // init filter
  filterTodo.value = 'uncompleted'

  document.addEventListener('keyup', (e) => {
    if (e.target.keyCode !== 13) return
    submitTodoHandler
  })

  function inputTextHandler(e) {
    setInputText(e.target.value)
  }

  function submitTodoHandler(e) {
    e.preventDefault()
    if (!todoInput.value) return

    const todoContainer = document.querySelector('#todo-container ul')
    if (todoContainer.lastChild) {
      removeChilds(todoContainer)
    }

    setToDos([
      ...todos,
      {
        text: inputText,
        completed: false,
        id: Math.random() * 1000
      }
    ])

    render({
      frag: TodoList,
      container: '#todo-container ul',
      props: { todos }
    })

    useEffect(() => {
      filterTodo.value = 'uncompleted'
    }, [todoInput.value])

    todoInput.value = ''
  }

  function todosManagementHandler(e) {
    const completeBtn = e.target.classList.contains('complete-btn')
      ? e.target
      : null
    const trashBtn = e.target.classList.contains('trash-btn') ? e.target : null
    if (!completeBtn && !trashBtn) return

    if (trashBtn) {
      setToDos(todos.filter((todo) => todo.id != e.target.parentNode.id))
      todoFilter(filterTodo.value)
      removeChilds(todosContainer)
      render({
        frag: TodoList,
        container: '#todo-container ul',
        props: { todos: todoFiltered }
      })
    }

    if (completeBtn) {
      setToDos(
        todos.map((todo) => {
          if (todo.id == e.target.parentNode.id) todo.completed = true
          return todo
        })
      )
      todoFilter(filterTodo.value)
      removeChilds(todosContainer)
      render({
        frag: TodoList,
        container: '#todo-container ul',
        props: { todos: todoFiltered }
      })
    }
  }

  function filterTodoHandler(e) {
    todoFilter(e.target.value)
    removeChilds(todosContainer)
    render({
      frag: TodoList,
      container: '#todo-container ul',
      props: { todos: todoFiltered }
    })
  }
})()
