import { writable, get } from 'svelte/store';
import { ID, DEFAULT_OPTIONS, parseDuration, objectMerge } from './utils';

import type {
	ToastFunction,
	ToastType,
	ToastPosition,
	ToastFunctionOptions,
	ToastComponentWithCustom
} from './types';

const TOASTS = writable<ToastComponentWithCustom[]>([]);

const insert = (type: ToastType, message: string, opts: ToastFunctionOptions = DEFAULT_OPTIONS) => {
	const id = ID();

	const customProps: Record<string, unknown> = opts?.component?.[1] || {};
	const { closable, component, infinite, rich, onMount, onRemove, duration } = objectMerge(
		DEFAULT_OPTIONS,
		opts
	) as Required<ToastFunctionOptions>;
	const DURATION = parseDuration(duration);

	const props: ToastComponentWithCustom = {
		id,
		type,
		message,
		duration: DURATION,
		closable,
		component,
		infinite,
		rich,
		...customProps
	};

	if (typeof window !== 'undefined') onMount?.();

	TOASTS.update(
		(toasts) => (toasts = get(position).includes('bottom') ? [...toasts, props] : [props, ...toasts])
	);

	if (!infinite) {
		setTimeout(() => {
			removeById(id);
			onRemove?.();
		}, DURATION);
	}
};

const removeById = (id: number) => {
	if (get(TOASTS).find((el) => el.id === id))
		TOASTS.update((toasts) => toasts.filter((toast) => toast.id !== id));
};
const removeByIndex = (index: number) => {
	if (get(TOASTS)[index]) TOASTS.update((toasts) => toasts.filter((_, i) => index !== i));
};
const removeAll = () => {
	TOASTS.set([]);
};

const createStore = () => {
	const { subscribe } = TOASTS;

	const info: ToastFunction = (message, opts = DEFAULT_OPTIONS) => insert('info', message, opts);
	const attention: ToastFunction = (message, opts = DEFAULT_OPTIONS) => insert('attention', message, opts);
	const success: ToastFunction = (message, opts = DEFAULT_OPTIONS) => insert('success', message, opts);
	const warning: ToastFunction = (message, opts = DEFAULT_OPTIONS) => insert('warning', message, opts);
	const error: ToastFunction = (message, opts = DEFAULT_OPTIONS) => insert('error', message, opts);

	return {
		/**
		 * Add a info type toast.\
		 * Usually indicates information to the user, but isn’t important.
		 * @param message The message to be displayed in the toast.
		 * @param opts Options for the toast.
		 */
		info,
		/**
		 * Add an attention type toast.\
		 * Indicate to the user with important information.
		 * @param message The message to be displayed in the toast.
		 * @param opts Options for the toast.
		 */
		attention,
		/**
		 * Add a success type toast.\
		 * Indicates to the user something good has happened.
		 * @param message The message to be displayed in the toast.
		 * @param opts Options for the toast.
		 */
		success,
		/**
		 * Add a warning type toast.\
		 * Tell the user something may be wrong but isn’t critical.
		 * @param message The message to be displayed in the toast.
		 * @param opts Options for the toast.
		 */
		warning,
		/**
		 * Add an error type toast.\
		 * Alert the user something critical has happened.
		 * @param message The message to be displayed in the toast.
		 * @param opts Options for the toast.
		 */
		error,
		/**
		 * Remove a toast based on the unique ID.
		 * @param id The unique ID of the toast.
		 */
		removeById,
		/**
		 * Remove a toast based on the index.
		 * @param index The index of the toast
		 */
		removeByIndex,
		/**
		 * Removes all toasts.
		 */
		removeAll,
		subscribe
	};
};

export const toast = createStore();

export const position = writable<ToastPosition>('bottom-left');
