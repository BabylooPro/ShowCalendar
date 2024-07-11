"use client";

// Inspired by react-hot-toast library
import * as React from "react";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 5; // Increase the limit to show more toasts
const DEFAULT_TOAST_REMOVE_DELAY = 10000; // 10 seconds

type ToasterToast = ToastProps & {
	id: string;
	title?: React.ReactNode;
	description?: React.ReactNode;
	action?: ToastActionElement;
	duration?: number;
};

const actionTypes = {
	ADD_TOAST: "ADD_TOAST",
	UPDATE_TOAST: "UPDATE_TOAST",
	DISMISS_TOAST: "DISMISS_TOAST",
	REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
	count = (count + 1) % Number.MAX_SAFE_INTEGER;
	return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
	| {
			type: ActionType["ADD_TOAST"];
			toast: ToasterToast;
	  }
	| {
			type: ActionType["UPDATE_TOAST"];
			toast: Partial<ToasterToast>;
	  }
	| {
			type: ActionType["DISMISS_TOAST"];
			toastId?: ToasterToast["id"];
	  }
	| {
			type: ActionType["REMOVE_TOAST"];
			toastId?: ToasterToast["id"];
	  };

interface State {
	toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string, duration: number = DEFAULT_TOAST_REMOVE_DELAY) => {
	if (toastTimeouts.has(toastId)) {
		return;
	}

	const timeout = setTimeout(() => {
		toastTimeouts.delete(toastId);
		dispatch({
			type: "REMOVE_TOAST",
			toastId: toastId,
		});
	}, duration);

	toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
	switch (action.type) {
		case "ADD_TOAST":
			return {
				...state,
				toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
			};

		case "UPDATE_TOAST":
			return {
				...state,
				toasts: state.toasts.map((t) =>
					t.id === action.toast.id ? { ...t, ...action.toast } : t
				),
			};

		case "DISMISS_TOAST": {
			const { toastId } = action;

			if (toastId) {
				const toast = state.toasts.find((t) => t.id === toastId);
				addToRemoveQueue(toastId, toast?.duration);
			} else {
				state.toasts.forEach((toast) => {
					addToRemoveQueue(toast.id, toast.duration);
				});
			}

			return {
				...state,
				toasts: state.toasts.map((t) =>
					t.id === toastId || toastId === undefined
						? {
								...t,
								open: false,
						  }
						: t
				),
			};
		}
		case "REMOVE_TOAST":
			if (action.toastId === undefined) {
				return {
					...state,
					toasts: [],
				};
			}
			return {
				...state,
				toasts: state.toasts.filter((t) => t.id !== action.toastId),
			};
	}
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
	memoryState = reducer(memoryState, action);
	listeners.forEach((listener) => {
		listener(memoryState);
	});
}

type Toast = Omit<ToasterToast, "id">;

function toast({ duration, ...props }: Toast) {
	const id = genId();

	const update = (props: ToasterToast) =>
		dispatch({
			type: "UPDATE_TOAST",
			toast: { ...props, id },
		});
	const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

	dispatch({
		type: "ADD_TOAST",
		toast: {
			...props,
			id,
			open: true,
			duration: duration ?? DEFAULT_TOAST_REMOVE_DELAY,
			onOpenChange: (open) => {
				if (!open) dismiss();
			},
		},
	});

	return {
		id: id,
		dismiss,
		update,
	};
}

function dismiss(toastId?: string) {
	dispatch({ type: "DISMISS_TOAST", toastId });
}

function useToast() {
	const [state, setState] = React.useState<State>(memoryState);

	React.useEffect(() => {
		listeners.push(setState);
		return () => {
			const index = listeners.indexOf(setState);
			if (index > -1) {
				listeners.splice(index, 1);
			}
		};
	}, [state]);

	return {
		...state,
		toast,
		dismiss,
	};
}

export { useToast, toast, dismiss };
