import { importCsvEntitiesAction } from '@/lib/server/actions';
import { getServerTranslator } from '@/lib/i18n/server';
import { CsvImportCard } from '@/components/setup/csv-import-card';

type ImportHubProps = {
  redirectTo: string;
  compact?: boolean;
};

export async function ImportHub({ redirectTo, compact = false }: ImportHubProps) {
  const { t } = await getServerTranslator();

  return (
    <section className={`panel page-stack ${compact ? 'import-hub-compact' : ''}`} id="imports">
      <div className="table-header-row">
        <div>
          <h2>{t('setup.import.title')}</h2>
          <p>{t('setup.import.description')}</p>
        </div>
        <span className="summary-pill">CSV</span>
      </div>

      <div className="grid-two">
        <CsvImportCard
          entity="customers"
          title={t('setup.import.customers')}
          description={t('setup.import.customersHelp')}
          hint={t('setup.import.hint')}
          sampleHeader={t('setup.import.samples.customers')}
          actionLabel={t('setup.import.confirm')}
          chooseFileLabel={t('setup.import.chooseFile')}
          mappingTitle={t('setup.import.mapping')}
          previewTitle={t('setup.import.preview')}
          emptyPreview={t('setup.import.emptyPreview')}
          noFileLabel={t('setup.import.noFile')}
          parseErrorNoColumns={t('setup.import.errors.noColumns')}
          parseErrorReadFile={t('setup.import.errors.readFailed')}
          fields={[
            { key: 'displayName', label: t('customers.fields.displayName'), required: true },
            { key: 'phone', label: t('customers.fields.phone') },
            { key: 'email', label: t('customers.fields.email') },
            { key: 'address', label: t('customers.fields.address') },
            { key: 'deliveryNote', label: t('customers.fields.deliveryNote') },
            { key: 'internalNote', label: t('customers.fields.internalNote') },
          ]}
          action={importCsvEntitiesAction}
          redirectTo={redirectTo}
        />

        <CsvImportCard
          entity="suppliers"
          title={t('setup.import.suppliers')}
          description={t('setup.import.suppliersHelp')}
          hint={t('setup.import.hint')}
          sampleHeader={t('setup.import.samples.suppliers')}
          actionLabel={t('setup.import.confirm')}
          chooseFileLabel={t('setup.import.chooseFile')}
          mappingTitle={t('setup.import.mapping')}
          previewTitle={t('setup.import.preview')}
          emptyPreview={t('setup.import.emptyPreview')}
          noFileLabel={t('setup.import.noFile')}
          parseErrorNoColumns={t('setup.import.errors.noColumns')}
          parseErrorReadFile={t('setup.import.errors.readFailed')}
          fields={[
            { key: 'name', label: t('setup.fields.supplierName'), required: true },
            { key: 'contact', label: t('setup.fields.contact') },
            { key: 'notes', label: t('setup.fields.notes') },
          ]}
          action={importCsvEntitiesAction}
          redirectTo={redirectTo}
        />

        <CsvImportCard
          entity="rawMaterials"
          title={t('setup.import.materials')}
          description={t('setup.import.materialsHelp')}
          hint={t('setup.import.hint')}
          sampleHeader={t('setup.import.samples.materials')}
          actionLabel={t('setup.import.confirm')}
          chooseFileLabel={t('setup.import.chooseFile')}
          mappingTitle={t('setup.import.mapping')}
          previewTitle={t('setup.import.preview')}
          emptyPreview={t('setup.import.emptyPreview')}
          noFileLabel={t('setup.import.noFile')}
          parseErrorNoColumns={t('setup.import.errors.noColumns')}
          parseErrorReadFile={t('setup.import.errors.readFailed')}
          fields={[
            { key: 'name', label: t('setup.fields.rawMaterialName'), required: true },
            { key: 'category', label: t('setup.fields.category') },
            { key: 'defaultUnit', label: t('setup.fields.defaultUnit') },
            { key: 'brand', label: t('setup.fields.brand') },
            { key: 'notes', label: t('setup.fields.notes') },
          ]}
          action={importCsvEntitiesAction}
          redirectTo={redirectTo}
        />
      </div>
    </section>
  );
}
