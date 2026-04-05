type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3
};

const LEVEL_STYLES: Record<LogLevel, string> = {
	debug: 'color: #9ca3af',
	info: 'color: #3b82f6',
	warn: 'color: #f59e0b',
	error: 'color: #ef4444; font-weight: bold'
};

let globalLevel: LogLevel = 'debug';

export function setLogLevel(level: LogLevel): void {
	globalLevel = level;
}

export function getLogLevel(): LogLevel {
	return globalLevel;
}

export interface Logger {
	debug(...args: unknown[]): void;
	info(...args: unknown[]): void;
	warn(...args: unknown[]): void;
	error(...args: unknown[]): void;
}

export function createLogger(namespace: string): Logger {
	function log(level: LogLevel, args: unknown[]): void {
		if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[globalLevel]) return;
		const prefix = `%c[${namespace}]`;
		const style = LEVEL_STYLES[level];
		switch (level) {
			case 'debug':
				console.debug(prefix, style, ...args);
				break;
			case 'info':
				console.info(prefix, style, ...args);
				break;
			case 'warn':
				console.warn(prefix, style, ...args);
				break;
			case 'error':
				console.error(prefix, style, ...args);
				break;
		}
	}

	return {
		debug: (...args: unknown[]) => log('debug', args),
		info: (...args: unknown[]) => log('info', args),
		warn: (...args: unknown[]) => log('warn', args),
		error: (...args: unknown[]) => log('error', args)
	};
}
