/**
 * Unified logging utility for the application
 * Provides structured logging with different log levels
 * Automatically disabled in production for debug logs
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogData {
	[key: string]: unknown;
}

class Logger {
	private isDevelopment = process.env.NODE_ENV === 'development';

	/**
	 * Internal log method that handles formatting and output
	 */
	private log(level: LogLevel, message: string, data?: LogData): void {
		// Skip debug logs in production
		if (!this.isDevelopment && level === 'debug') {
			return;
		}

		const timestamp = new Date().toISOString();
		const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

		// Format the log message
		const formattedMessage = data ? `${prefix} ${message}` : `${prefix} ${message}`;

		// Output based on log level
		switch (level) {
			case 'error':
				console.error(formattedMessage, data || '');
				break;
			case 'warn':
				console.warn(formattedMessage, data || '');
				break;
			case 'info':
				console.info(formattedMessage, data || '');
				break;
			case 'debug':
			default:
				console.log(formattedMessage, data || '');
				break;
		}
	}

	/**
	 * Log debug information (only in development)
	 * @param message - Debug message
	 * @param data - Optional additional data
	 */
	debug(message: string, data?: LogData): void {
		this.log('debug', message, data);
	}

	/**
	 * Log informational messages
	 * @param message - Info message
	 * @param data - Optional additional data
	 */
	info(message: string, data?: LogData): void {
		this.log('info', message, data);
	}

	/**
	 * Log warning messages
	 * @param message - Warning message
	 * @param data - Optional additional data
	 */
	warn(message: string, data?: LogData): void {
		this.log('warn', message, data);
	}

	/**
	 * Log error messages
	 * @param message - Error message
	 * @param data - Optional additional data (can include error object)
	 */
	error(message: string, data?: LogData): void {
		this.log('error', message, data);
	}
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other files
export type { LogLevel, LogData };
