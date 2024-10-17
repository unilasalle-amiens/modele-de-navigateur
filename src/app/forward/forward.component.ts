import { Component, OnInit, inject, ChangeDetectorRef } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { BrowserService } from "../browser.service";


@Component({
  selector: 'app-forward',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './forward.component.html',
  styleUrl: './forward.component.css'
})
export class ForwardComponent {
  public browserService = inject(BrowserService);
}