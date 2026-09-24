import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly loading$;

  constructor(private readonly loadingService: LoadingService) {
    this.loading$ = this.loadingService.loading$;
  }
}

