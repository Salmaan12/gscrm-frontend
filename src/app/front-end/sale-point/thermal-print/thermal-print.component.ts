import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-thermal-print',
  template: '',
  styleUrl: './thermal-print.component.css',
})
export class ThermalPrintComponent {
  @Input() savedEntries: any[] = [];

  printThermalReceipt(): void {
    const entries = this.savedEntries;

    if (!entries?.length) {
      return;
    }

    const firstEntry = entries[0];

    const referenceNo = firstEntry.referenceNo || '-';
    const customerName = firstEntry.customerName || '-';
    const createdDate = firstEntry.createdDate || '-';
    const createdTime = firstEntry.createdTime || '-';

    const formatNumber = (
      value: number | string | null | undefined,
      decimals = 2,
    ): string => {
      return (Number(value) || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: decimals,
      });
    };

    const escapeHtml = (value: any): string => {
      return String(value ?? '').replace(/[&<>"']/g, (char: string) => {
        const entities: Record<string, string> = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        };

        return entities[char];
      });
    };

    // Keep weight calculations consistent with the Sale Point table.
    const getWeight = (entry: any): number => {
      const type = String(entry.productType || '').toLowerCase();

      // Main Ginni item displays its pure weight.
      if (type === 'ginni' || type === 'coin' || type === 'lab') {
        return Number(entry.pureWeight) || 0;
      }

      // Only the actual Bar item multiplies unit weight by quantity.
      if (type === 'bar') {
        return (Number(entry.weight) || 0) * (Number(entry.qty) || 0);
      }

      // PC uses its already-calculated total weight.
      // Cash keeps its associated weight, matching your screenshot.
      return Number(entry.weight) || 0;
    };

    const receivedEntries = entries.filter(
      (entry: any) => entry.transactionCategory === 'RECEIVED',
    );

    const givenEntries = entries.filter(
      (entry: any) => entry.transactionCategory === 'GIVEN',
    );

    const totalReceivedWeight = receivedEntries.reduce(
      (total: number, entry: any) => total + getWeight(entry),
      0,
    );

    const totalGivenWeight = givenEntries.reduce(
      (total: number, entry: any) => total + getWeight(entry),
      0,
    );

    const totalReceivedAmount = receivedEntries.reduce(
      (total: number, entry: any) => total + (Number(entry.amount) || 0),
      0,
    );

    const totalGivenAmount = givenEntries.reduce(
      (total: number, entry: any) => total + (Number(entry.amount) || 0),
      0,
    );

    const balanceWeight = totalReceivedWeight - totalGivenWeight;
    const balanceAmount = totalReceivedAmount - totalGivenAmount;

    // Product-specific detail row.
    const detailRow = (label: string, value: any): string => `
    <div class="detail-row">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value ?? '-')}</strong>
    </div>
  `;

    const itemRows = entries
      .map((entry: any, index: number) => {
        const type = String(entry.productType || '').toLowerCase();
        const details = entry.productDetails || {};
        const isReceived = entry.transactionCategory === 'RECEIVED';

        let productDetails = '';

        // Ginni refining charge entry.
        if (type.startsWith('ginni -')) {
          productDetails = [
            detailRow(
              'Refining Charges',
              formatNumber(entry.refining || details.refiningCharges),
            ),
            detailRow('Charge Amount', formatNumber(entry.amount)),
          ].join('');
        }

        // Main Ginni item.
        else if (type === 'ginni') {
          productDetails = [
            detailRow(
              'Weight',
              `${formatNumber(details.ginniWeight ?? entry.weight, 3)} g`,
            ),
            detailRow('Report', details.report ?? entry.report ?? '-'),
            detailRow(
              'Pure Weight',
              `${formatNumber(entry.pureWeight ?? details.pureWeight, 3)} g`,
            ),
            // detailRow(
            //   'Refining Charges',
            //   formatNumber(details.refiningCharges ?? entry.refining),
            // ),
          ].join('');
        }

        // Main Ginni item.
        else if (type === 'lab') {
          productDetails = [
            detailRow(
              'Weight',
              `${formatNumber(details.weight ?? entry.weight, 3)} g`,
            ),
            detailRow('Report', details.report ?? entry.report ?? '-'),
            detailRow(
              'Pure Weight',
              `${formatNumber(entry.pureWeight ?? details.pureWeight, 3)} g`,
            ),
            // detailRow(
            //   'Refining Charges',
            //   formatNumber(details.refiningCharges ?? entry.refining),
            // ),
          ].join('');
        }

        // PC difference entry.
        else if (type.startsWith('pc -')) {
          productDetails = [
            detailRow(
              'Brand',
              `${details.brandName} ${details.skuName}` || '-',
            ),
            //detailRow('SKU', details.skuName || '-'),
            detailRow('Difference / Unit', formatNumber(entry.difference)),
            detailRow('Difference Total', formatNumber(entry.amount)),
          ].join('');
        }

        // Main PC item.
        else if (type === 'pc') {
          productDetails = [
            detailRow(
              'Brand',
              `${details.brandName} ${details.skuName}` || '-',
            ),
            //detailRow('SKU', details.skuName || '-'),
            detailRow('Quantity', entry.qty ?? details.qty ?? 0),
            detailRow(
              'Unit Weight',
              `${formatNumber(
                (Number(details.weight ?? entry.weight) || 0) /
                  Math.max(Number(entry.qty) || 1, 1),
                3,
              )} g`,
            ),
            detailRow(
              'Total Weight',
              `${formatNumber(details.weight ?? entry.weight, 3)} g`,
            ),
            // detailRow('Difference / Unit', formatNumber(entry.difference)),
            // detailRow('Difference Total', formatNumber(entry.differenceTotal)),
          ].join('');
        }

        // Bar making charge entry.
        else if (type.startsWith('bar - making')) {
          productDetails = [
            detailRow(
              'Brand',
              `${details.brandName} ${details.skuName}` || '-',
            ),
            //detailRow('SKU', details.skuName || '-'),
            detailRow('Making / Unit', formatNumber(entry.making)),
            detailRow('Making Total', formatNumber(entry.amount)),
          ].join('');
        }

        // Main Bar item.
        else if (type === 'bar') {
          const quantity = Number(entry.qty) || 0;
          const unitWeight = Number(details.weight ?? entry.weight) || 0;

          productDetails = [
            detailRow(
              'Brand',
              `${details.brandName} ${details.skuName}` || '-',
            ),
            //detailRow('SKU', details.skuName || '-'),
            detailRow('Quantity', quantity),
            detailRow('Unit Weight', `${formatNumber(unitWeight, 3)} g`),
            detailRow(
              'Total Weight',
              `${formatNumber(unitWeight * quantity, 3)} g`,
            ),
            // detailRow('Making / Unit', formatNumber(entry.making)),
            // detailRow('Making Total', formatNumber(entry.makingTotal)),
            ...(Number(entry.difference) > 0
              ? [detailRow('Difference / Unit', formatNumber(entry.difference))]
              : []),
          ].join('');
        }

        // Cash entry.
        else if (type.includes('cash')) {
          productDetails = [
            detailRow('Currency', details.currency || 'PKR'),
            detailRow(
              'Cash Amount',
              formatNumber(details.amount ?? entry.amount),
            ),
            detailRow(
              'Weight',
              `${formatNumber(details.weight ?? entry.weight, 3)} g`,
            ),
            // ...(Number(entry.difference) > 0
            //   ? [detailRow('Difference', formatNumber(entry.difference))]
            //   : []),
          ].join('');
        } else if (type === 'coin') {
          const quantity = Number(entry.qty) || 0;
          const unitWeight = Number(details.weight ?? entry.weight) || 0;

          productDetails = [
            detailRow(
              'Brand',
              `${details.brandName} ${details.skuName}` || '-',
            ),
            detailRow('Quantity', quantity),
            detailRow('Karat', details.karat),
            detailRow('Unit Weight', `${formatNumber(unitWeight, 3)} g`),
            detailRow(
              'Total Weight',
              `${formatNumber(unitWeight * quantity, 3)} g`,
            ),
          ].join('');
        }

        // Bar making charge entry.
        else if (type.startsWith('coin -')) {
          productDetails = [
            detailRow(
              'Brand',
              `${details.brandName} ${details.skuName}` || '-',
            ),
            //detailRow('SKU', details.skuName || '-'),
            detailRow('Making / Unit', formatNumber(entry.making)),
            detailRow('Making Total', formatNumber(entry.amount)),
          ].join('');
        }

        // Generic fallback for other items.
        else {
          productDetails = [
            ...(Number(entry.qty) > 0
              ? [detailRow('Quantity', entry.qty)]
              : []),
            ...(Number(entry.making) > 0
              ? [detailRow('Making Charges', formatNumber(entry.making))]
              : []),
            ...(Number(entry.refining) > 0
              ? [detailRow('Refining Charges', formatNumber(entry.refining))]
              : []),
            ...(Number(entry.difference) > 0
              ? [detailRow('Difference', formatNumber(entry.difference))]
              : []),
          ].join('');
        }

        return `
      <tr class="item-row">
        <td class="item-number">${index + 1}.</td>
        <td class="item-content">
          <div class="product-name">
            ${escapeHtml(entry.productType || '-')}
          </div>

          <div class="category ${isReceived ? 'received' : 'given'}">
            ${isReceived ? '↓ RECEIVED' : '↑ GIVEN'}
          </div>

          <div class="product-details">
            ${productDetails}
          </div>

          <table class="item-values">
            <tr>
              ${
                Number(entry.rate) > 0
                  ? `
                <td>
                  <small>RATE</small>
                  <strong>${formatNumber(entry.rate)}</strong>
                </td>
              `
                  : ''
              }
              ${
                Number(entry.weight) > 0
                  ? `
                <td>
                  <small>WEIGHT</small>
                  <strong>${formatNumber(getWeight(entry), 3)}</strong>
                </td>
              `
                  : ''
              }
              ${
                Number(entry.amount) > 0
                  ? `
                <td>
                  <small>AMOUNT</small>
                  <strong>${formatNumber(entry.amount)}</strong>
                </td>
              `
                  : ''
              }
            </tr>
          </table>
        </td>
      </tr>
    `;
      })
      .join('');

    const printWindow = window.open('', '_blank', 'width=420,height=750');

    if (!printWindow) {
      alert('Please allow pop-ups for this website to print the receipt.');
      return;
    }

    const css = this.getThermalReceiptCss();

    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>KW Gold & Silver - ${escapeHtml(referenceNo)}</title>
        <style>${css}</style>
      </head>

      <body>
        <main class="receipt">

          <header class="header">
            <h2>KW GOLD &amp; SILVER</h2>
            <div class="subtitle">GOLD • SILVER</div>
            <div class="receipt-tag">SALE POINT RECEIPT</div>
          </header>

          <section class="reference-box">
            <div class="reference-label">Transaction Reference</div>
            <div class="reference-number">${escapeHtml(referenceNo)}</div>
          </section>

          <section class="customer-box">
            <div class="info-row">
              <span>Customer</span>
              <strong>${escapeHtml(customerName)}</strong>
            </div>
            <div class="info-row">
              <span>Date</span>
              <strong>${escapeHtml(createdDate)}</strong>
            </div>
            <div class="info-row">
              <span>Time</span>
              <strong>${escapeHtml(createdTime)}</strong>
            </div>
          </section>

          <div class="section-heading">Transaction Details</div>

          <table class="items-table">
            <tbody>${itemRows}</tbody>
          </table>

          <section class="summary">
            <div class="summary-title">TRANSACTION SUMMARY</div>

            <div class="summary-subheading">Weight Summary</div>

            <div class="summary-row">
              <span>Total Received Weight</span>
              <strong>${formatNumber(totalReceivedWeight, 3)} g</strong>
            </div>

            <div class="summary-row">
              <span>Total Given Weight</span>
              <strong>${formatNumber(totalGivenWeight, 3)} g</strong>
            </div>

            <div class="summary-row balance">
              <span>Net Weight</span>
              <strong>${formatNumber(balanceWeight, 3)} g</strong>
            </div>

            <div class="summary-subheading">Amount Summary</div>
    
              <div class="summary-row">
                <span>Total Received Amount</span>
                <strong>${formatNumber(totalReceivedAmount)}</strong>
              </div>
    
              <div class="summary-row">
                <span>Total Given Amount</span>
                <strong>${formatNumber(totalGivenAmount)}</strong>
              </div>
    
              <div class="summary-row balance">
                <span>Net Amount</span>
                <strong>${formatNumber(balanceAmount)}</strong>
              </div>
          </section>

          <footer class="receipt-footer">
            <div class="thank-you">THANK YOU FOR YOUR BUSINESS!</div>
            <div>We appreciate your trust in KW Gold &amp; Silver.</div>

            <div class="footer-line"></div>

            <div class="small-note">
              Please verify the weight, rate and amount before leaving.
            </div>

            <div class="small-note">
              Reference: ${escapeHtml(referenceNo)}
            </div>

            <div class="footer-line"></div>

            <div class="footer-bottom">• • • • • • • • • • • •</div>
          </footer>

        </main>

        <script>
          window.onload = function () {
            window.focus();
            window.print();
          };

          window.onafterprint = function () {
            window.close();
          };
        </script>
      </body>
    </html>
  `;

    console.log(html);

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  private getThermalReceiptCss(): string {
    return `
    @page {
      size: 80mm auto;
      margin: 0;
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      width: 80mm;
      margin: 0;
      padding: 0;
      background: #fff;
      color: #000;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10px;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body {
      overflow-wrap: anywhere;
    }

    /* Main receipt width */
    .receipt {
      width: 72mm;
      max-width: 72mm;
      margin: 0 auto;
      padding: 2mm 1mm;
      background: #fff;
      color: #000;
    }

    /* Business header */
    .header {
      width: 100%;
      text-align: center;
      padding: 5px 0 8px;
      margin-bottom: 8px;
      border-bottom: 2px solid #000;
    }

    .header h2 {
      margin: 0 0 4px;
      padding: 0;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 17px;
      line-height: 1.3;
      font-weight: 800;
      letter-spacing: 0;
      text-align: center;
    }

    .subtitle {
      margin-bottom: 6px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1px;
      text-align: center;
    }

    .receipt-tag {
      display: inline-block;
      margin-top: 3px;
      padding: 3px 8px;
      border: 1px solid #000;
      font-size: 9px;
      font-weight: 700;
    }

    /* Transaction reference */
    .reference-box {
      margin-bottom: 8px;
      padding: 6px 4px;
      border: 1px dashed #000;
      text-align: center;
      overflow-wrap: anywhere;
    }

    .reference-label {
      margin-bottom: 3px;
      font-size: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .reference-number {
      font-size: 12px;
      font-weight: 800;
      overflow-wrap: anywhere;
    }

    /* Customer and transaction information */
    .customer-box {
      padding: 4px 0 7px;
      margin-bottom: 8px;
      border-bottom: 1px dashed #000;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 6px;
      margin: 4px 0;
      font-size: 10px;
    }

    .info-row span {
      flex: 0 0 auto;
      color: #333;
    }

    .info-row strong {
      flex: 1;
      min-width: 0;
      text-align: right;
      font-weight: 700;
      overflow-wrap: anywhere;
    }

    /* Transaction section heading */
    .section-heading {
      margin: 9px 0 5px;
      padding-bottom: 4px;
      border-bottom: 1px solid #000;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    /* Product rows */
    .items-table {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
    }

    .items-table .item-row {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .item-number {
      width: 8%;
      padding: 7px 2px 8px 0;
      vertical-align: top;
      font-weight: 700;
      font-size: 10px;
    }

    .item-content {
      width: 92%;
      min-width: 0;
      padding: 5px 0 8px;
      vertical-align: top;
    }

    .product-name {
      margin-bottom: 2px;
      font-size: 11px;
      font-weight: 800;
      line-height: 1.4;
      overflow-wrap: anywhere;
    }

    .category {
      display: inline-block;
      margin: 3px 0 4px;
      padding: 2px 5px;
      border: 1px solid #000;
      font-size: 8px;
      font-weight: 700;
      line-height: 1.3;
    }

    .received {
      border-style: solid;
    }

    .given {
      border-style: solid;
    }

    /* Product-specific information */
    .product-details {
      margin: 3px 0 5px;
      padding-left: 5px;
      border-left: 2px solid #777;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 5px;
      padding: 2px 0;
      font-size: 9px;
      line-height: 1.35;
    }

    .detail-row span {
      flex: 1;
      min-width: 0;
      color: #333;
      overflow-wrap: anywhere;
    }

    .detail-row strong {
      flex: 0 1 auto;
      max-width: 60%;
      text-align: right;
      font-weight: 700;
      overflow-wrap: anywhere;
    }

    /* Rate, weight and amount */
    .item-values {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      margin-top: 5px;
      border-top: 1px dashed #000;
      border-bottom: 1px dashed #000;
    }

    .item-values td {
      width: 33.33%;
      padding: 5px 2px;
      vertical-align: top;
      text-align: right;
      font-size: 9px;
      overflow-wrap: anywhere;
    }

    .item-values td:first-child {
      text-align: left;
    }

    .item-values small {
      display: block;
      margin-bottom: 2px;
      font-size: 8px;
      font-weight: 700;
    }

    .item-values strong {
      display: block;
      font-size: 9px;
      font-weight: 700;
      overflow-wrap: anywhere;
    }

    /* Summary */
    .summary {
      margin-top: 5px;
      padding-top: 5px;
      border-top: 2px solid #000;
    }

    .summary-title {
      margin: 9px 0 5px;
      padding-bottom: 4px;
      border-bottom: 1px solid #000;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .summary-subheading {
      margin: 7px 0 3px;
      padding-bottom: 3px;
      border-bottom: 1px dotted #777;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 6px;
      padding: 4px 2px;
      font-size: 9px;
      line-height: 1.4;
    }

    .summary-row span {
      flex: 1;
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .summary-row strong {
      flex: 0 1 auto;
      max-width: 48%;
      text-align: right;
      font-weight: 700;
      overflow-wrap: anywhere;
    }

    .summary-row.balance {
      margin-top: 3px;
      padding: 6px 3px;
      border-top: 1px dashed #000;
      border-bottom: 1px dashed #000;
      font-size: 11px;
      font-weight: 800;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .summary-row.balance strong {
      font-size: 11px;
    }

    /* Footer */
    .receipt-footer {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 2px dashed #000;
      text-align: center;
      font-size: 9px;
      line-height: 1.6;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .thank-you {
      margin-bottom: 3px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0;
    }

    .footer-line {
      margin: 7px 0;
      border-top: 1px dotted #777;
    }

    .small-note {
      font-size: 8px;
      color: #222;
      overflow-wrap: anywhere;
    }

    .signature {
      margin: 7px 0;
      font-size: 9px;
      font-weight: 700;
    }

    .footer-bottom {
      margin-top: 6px;
      letter-spacing: 1px;
      font-size: 9px;
    }

    /* Browser preview */
    @media screen {
      html,
      body {
        width: 80mm;
        margin: 0 auto;
      }

      body {
        padding: 10px 0;
        background: #eee;
      }

      .receipt {
        background: #fff;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.15);
      }
    }

    /* Physical printing */
    @media print {
      html,
      body {
        width: 80mm;
        margin: 0;
        padding: 0;
        background: #fff;
      }

      .receipt {
        width: 72mm;
        max-width: 72mm;
        margin: 0 auto;
        padding: 2mm 1mm;
        box-shadow: none;
      }

      .items-table .item-row,
      .summary-row.balance,
      .receipt-footer {
        break-inside: avoid;
        page-break-inside: avoid;
      }
    }
  `;
  }
}
