import * as z from "zod";

interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

interface TaskState {
    todos: Todo[];
    length: number;
    completed: number;
    pending: number;
}

export type TaskAction =
    | { type: 'ADD_TODO', payload: string }
    | { type: 'TOGGLE_TODO', payload: number }
    | { type: 'DELETE_TODO', payload: number }

const TodoSchema = z.object({
    id: z.number(),
    text: z.string(),
    completed: z.boolean()
})

const TaskStateScheme = z.object({
    todos: z.array(TodoSchema),
    length: z.number(),
    completed: z.number(),
    pending: z.number(),
})

export const getTasksInitialState = (): TaskState => {
    const localStorageState = localStorage.getItem('tasks-state');

    if (!localStorageState) {
        return {
            todos: [],
            length: 0,
            completed: 0,
            pending: 0,
        }
    }

    // Validad mediante Zod
    const result = TaskStateScheme.safeParse(JSON.parse(localStorageState))

    if (result.error) {
        console.log(result.error);
        return {
            todos: [],
            length: 0,
            completed: 0,
            pending: 0,
        }
    }

    // ! Cuidado porque el objeto puede haber sido manipulado
    return result.data
}

export const taskReducer = (state: TaskState, action: TaskAction): TaskState => {

    switch (action.type) {

        case 'ADD_TODO': {
            const newTodo: Todo = {
                id: Date.now(),
                text: action.payload.trim(),
                completed: false
            };

            // ! No lo deben hacer
            // state.todos.push(newTodo)

            return {
                ...state,
                todos: [...state.todos, newTodo],
                length: [...state.todos, newTodo].length,
                pending: state.pending + 1,
            };
        }

        case 'DELETE_TODO': {
            const currentTodos = state.todos.filter(todo => todo.id !== action.payload);

            return {
                ...state,
                todos: currentTodos,
                length: currentTodos.length,
                completed: currentTodos.filter(completed => completed.completed).length,
                pending: currentTodos.filter(pending => !pending.completed).length,
            };
        }

        case 'TOGGLE_TODO': {
            const updateTodos = state.todos.map(todo => {
                if (todo.id === action.payload) {
                    return { ...todo, completed: !todo.completed }
                }
                return todo
            })
            return {
                ...state,
                todos: updateTodos,
                completed: updateTodos.filter(completed => completed.completed).length,
                pending: updateTodos.filter(pending => !pending.completed).length,
            };
        }

        default:
            return state;
    }
}