import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for ePayco webhook confirmation payload.
 * ePayco sends these fields via POST to the confirmation URL.
 *
 * Response codes (x_cod_response):
 * 1 = Aceptada (Accepted/Approved)
 * 2 = Rechazada (Rejected)
 * 3 = Pendiente (Pending)
 * 4 = Fallida (Failed)
 * 6 = Reversada (Reversed)
 * 7 = Retenida (Held for review)
 * 8 = Iniciada (Initiated)
 * 9 = Expirada (Expired)
 * 10 = Abandonada (Abandoned)
 * 11 = Cancelada (Cancelled)
 * 12 = Antifraude (Antifraud)
 */
export class EpaycoConfirmationDto {
  @ApiPropertyOptional({ description: 'Customer ID in ePayco' })
  x_cust_id_cliente?: string;

  @ApiPropertyOptional({ description: 'ePayco reference' })
  x_ref_payco?: string;

  @ApiPropertyOptional({
    description: 'Merchant invoice/reference (our orderId)',
  })
  x_id_invoice?: string;

  @ApiPropertyOptional({ description: 'Transaction description' })
  x_description?: string;

  @ApiPropertyOptional({ description: 'Transaction amount' })
  x_amount?: string;

  @ApiPropertyOptional({ description: 'Base amount (before tax)' })
  x_amount_base?: string;

  @ApiPropertyOptional({ description: 'Tax amount' })
  x_tax?: string;

  @ApiPropertyOptional({ description: 'Currency code (COP, USD, etc.)' })
  x_currency_code?: string;

  @ApiPropertyOptional({ description: 'Bank name' })
  x_bank_name?: string;

  @ApiPropertyOptional({ description: 'Card brand (VISA, MASTERCARD, etc.)' })
  x_cardnumber?: string;

  @ApiPropertyOptional({ description: 'Transaction quotas/installments' })
  x_quotas?: string;

  @ApiPropertyOptional({
    description: 'Response code: 1=Approved, 2=Rejected, 3=Pending, 4=Failed',
  })
  x_cod_response?: string;

  @ApiPropertyOptional({ description: 'Response message' })
  x_response?: string;

  @ApiPropertyOptional({ description: 'Response reason/motive' })
  x_response_reason_text?: string;

  @ApiPropertyOptional({ description: 'Authorization code from the bank' })
  x_approval_code?: string;

  @ApiPropertyOptional({ description: 'Transaction type' })
  x_transaction_id?: string;

  @ApiPropertyOptional({ description: 'Transaction date' })
  x_transaction_date?: string;

  @ApiPropertyOptional({ description: 'Franchise (payment method)' })
  x_franchise?: string;

  @ApiPropertyOptional({
    description: 'Test transaction flag (1=test, 0=production)',
  })
  x_test_request?: string;

  @ApiPropertyOptional({ description: 'ePayco signature for validation' })
  x_signature?: string;

  @ApiPropertyOptional({ description: 'Extra field 1 (used for orderId)' })
  x_extra1?: string;

  @ApiPropertyOptional({ description: 'Extra field 2' })
  x_extra2?: string;

  @ApiPropertyOptional({ description: 'Extra field 3' })
  x_extra3?: string;

  // Allow any additional fields ePayco might send
  [key: string]: string | undefined;
}
