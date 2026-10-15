import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface KwGoldReportForm {
  reportDate: string;
  referenceNo: string | number;
  clientName: string;
  customerCNIC: string;
  clientNumber: string;
  dateReceived: string;
  reportNumber: string | number;
  weight: string | number;
  silverPct: string | number;
  platinumPct: string | number;
  palladiumPct: string | number;
  purityKg: string;
}

@Component({
  selector: 'app-kw-gold-report',
  templateUrl: './kw-gold-report.component.html',
  styleUrls: ['./kw-gold-report.component.css']
})
export class KwGoldReportComponent implements OnInit {
  @ViewChild('pageRef') pageRef!: ElementRef<HTMLElement>;

  // Update this path to match where silverRateWork.png is stored in your Angular assets folder.
  logoPath = 'assets/silverRateWork.png';

  form: KwGoldReportForm = this.getEmptyForm();

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const data = params.get('data');
      if (!data) return;

      try {
        // Supports both URLSearchParams-decoded JSON and explicitly encoded JSON.
        let customerData: any;
        try {
          customerData = JSON.parse(data);
        } catch {
          customerData = JSON.parse(decodeURIComponent(data));
        }

        const reportDate = customerData?.reportDate
          ? this.toDateInputValue(customerData.reportDate)
          : this.toDateInputValue(new Date());

        

        this.form = {
          ...this.getEmptyForm(),
          referenceNo: customerData?.referenceNo ?? '',
          clientName: customerData?.customer?.customerName ?? '',
          customerCNIC: customerData?.customer?.customerCNIC ?? '',
          clientNumber: customerData?.customer?.customerContact ?? '',
          reportNumber: customerData?.lab?.report ?? '',
          weight: customerData?.lab?.weight ?? '',
          silverPct: customerData?.lab?.pureWeight ?? '',
          reportDate
        };
      } catch (error) {
        console.error('Unable to parse report data from query parameter:', error);
      }
    });
  }

  private getEmptyForm(): KwGoldReportForm {
    return {
      reportDate: this.toDateInputValue(new Date()),
      referenceNo: '', clientName: '', customerCNIC: '', clientNumber: '',
      dateReceived: '', reportNumber: '', weight: '', silverPct: '',
      platinumPct: '', palladiumPct: '', purityKg: ''
    };
  }

  private toDateInputValue(value: string | Date): string {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  handlePrint(): void {
    window.print();
  }

  async handlePDF(): Promise<void> {
    if (!this.pageRef?.nativeElement) return;

    // html2pdf.js has no TypeScript typings in some versions, so load it dynamically.
    const module = await import('html2pdf.js');
    const html2pdf = (module as any).default ?? module;
    const options = {
      margin: 0,
      filename: `KW_Gold_Report_${this.form.referenceNo || '001'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(options).from(this.pageRef.nativeElement).save();
  }
}
