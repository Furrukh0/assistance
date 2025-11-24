import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
  standalone: false
})

/**
 * Index Component
 */
export class IndexComponent implements OnInit {

  @ViewChild('contactSection') contactSection!: ElementRef;

  currentSection = 'home';
  showNavigationArrows: any;
  showNavigationIndicators: any;
  userData :any;

  cta1Data = {
    href: "",
    buttonText: "Sechdual Meeting",
    title: "100% of your calls. Zero manual effort."
  }
  cta2Data = {
    href: "",
    buttonText: "Request a Demo",
    title: "The intelligence your call center has been missing"
  }

  constructor(private authService:AuthenticationService) { }

  ngOnInit(): void {
    this.userData = JSON.parse(this.authService.getUserDetails());
  }

  /**
   * Window scroll method
   */
  // tslint:disable-next-line: typedef
  windowScroll() {
    const navbar = document.getElementById('navbar');
    if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) {
      navbar?.classList.add('is-sticky');
    }
    else {
      navbar?.classList.remove('is-sticky');
    }

    // Top Btn Set
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
      (document.getElementById("back-to-top") as HTMLElement).style.display = "block"
    } else {
      (document.getElementById("back-to-top") as HTMLElement).style.display = "none"
    }
  }

  /**
  * Section changed method
  * @param sectionId specify the current sectionID
  */
  onSectionChange(sectionId: string) {
    this.currentSection = sectionId;
  }

  /**
   * Toggle navbar
   */
  toggleMenu() {
    document.getElementById('navbarSupportedContent')?.classList.toggle('show');
  }

  // When the user clicks on the button, scroll to the top of the document
  topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  scrollToContact() {
    this.contactSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

}
