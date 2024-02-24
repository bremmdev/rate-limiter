import { TableClient, AzureNamedKeyCredential } from "@azure/data-tables";

export function getClient() {
  const accountName = process.env.AZURE_TABLES_ACCOUNT_NAME || "";
  const accessKey = process.env.AZURE_TABLES_ACCESS_KEY || "";
  const acountUrl = `https://${accountName}.table.core.windows.net/`;
  const tableName = process.env.AZURE_TABLES_TABLE_NAME || "";
  const credential = new AzureNamedKeyCredential(accountName, accessKey);
  const client = new TableClient(acountUrl, tableName, credential);
  return client;
}
