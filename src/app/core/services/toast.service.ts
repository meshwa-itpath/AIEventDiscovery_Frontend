import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private messageService = inject(MessageService);

  /**
   * Displays a success toast message
   * @param message The message to display
   * @param title Optional title (defaults to 'Success')
   */
  success(message: string, title: string = 'Success') {
    this.messageService.add({ severity: 'success', summary: title, detail: message });
  }

  /**
   * Displays an error toast message
   * @param message The message to display
   * @param title Optional title (defaults to 'Error')
   */
  error(message: string, title: string = 'Error') {
    this.messageService.add({ severity: 'error', summary: title, detail: message });
  }

  /**
   * Displays an info toast message
   * @param message The message to display
   * @param title Optional title (defaults to 'Info')
   */
  info(message: string, title: string = 'Info') {
    this.messageService.add({ severity: 'info', summary: title, detail: message });
  }

  /**
   * Displays a warning toast message
   * @param message The message to display
   * @param title Optional title (defaults to 'Warning')
   */
  warn(message: string, title: string = 'Warning') {
    this.messageService.add({ severity: 'warn', summary: title, detail: message });
  }
}
