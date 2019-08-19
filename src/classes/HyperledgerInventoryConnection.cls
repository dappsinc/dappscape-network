/**
 *   Extends the DataSource.Connection class to enable 
 *   Salesforce to sync the external system’s schema 
 *   and to handle queries and searches of the external data. 
 **/
global class HyperledgerInventoryConnection 
    extends DataSource.Connection {

    /**
     *   Constructors.
     **/
    global HyperledgerInventoryConnection(
        DataSource.ConnectionParams connectionParams) {
    }
    global HyperledgerInventoryConnection() {}
    
    
        // Search 
        // 
        // 
            override global List<DataSource.TableResult> search(
            DataSource.SearchContext context) {
        List<DataSource.TableResult> results =
                new List<DataSource.TableResult>();

        for (Integer i =0;i< context.tableSelections.size();i++) {
            String entity = context.tableSelections[i].tableSelected;

            // Search usernames
            String url = 'callout:CPQ' + '/api/Product/'
                            + context.searchPhrase;
            results.add(DataSource.TableResult.get(
                    true, null, entity, getData(url)));
        }

        return results;
    }
        
        
/**
     *   Called to query and get results from the external 
     *   system for SOQL queries, list views, and detail pages 
     *   for an external object that’s associated with the 
     *   external data source.
     *   
     *   The queryContext argument represents the query to run 
     *   against a table in the external system.
     *   
     *   Returns a list of rows as the query results.
     **/
    override global DataSource.TableResult query(
            DataSource.QueryContext context) {
        DataSource.Filter filter = context.tableSelection.filter;
        String url;
        if (filter != null) {
            String thisColumnName = filter.columnName;
            if (thisColumnName != null &&
               (thisColumnName.equals('ExternalId') ||
                thisColumnName.equals('name')))
                url = 'callout:CPQ' + '/api/Product/'
                        + filter.columnValue;
            else
                    url = 'callout:CPQ' + '/api/Product';
        } else {
            url = 'callout:CPQ' + '/api/Product';
        }

        /**
         * Filters, sorts, and applies limit and offset clauses.
         **/
        List<Map<String, Object>> rows =
                DataSource.QueryUtils.process(context, getData(url));
        return DataSource.TableResult.get(true, null,
                context.tableSelection.tableSelected, rows);
    }
        
          /**
           * 
       

    /**
     *   Called when an external object needs to get a list of 
     *   schema from the external data source, for example when 
     *   the administrator clicks “Validate and Sync” in the 
     *   user interface for the external data source.   
     **/
      override global List<DataSource.Table> sync() {
        List<DataSource.Table> tables =
            new List<DataSource.Table>();
        List<DataSource.Column> columns;
        columns = new List<DataSource.Column>();
        columns.add(DataSource.Column.text('$class',255));
        columns.add(DataSource.Column.text('ProductName',255));
        columns.add(DataSource.Column.text('blockchainId',255));
        columns.add(DataSource.Column.text('SKU',255));
        columns.add(DataSource.Column.text('type',255));
        columns.add(DataSource.Column.text('classification',255));
        columns.add(DataSource.Column.text('inventoryStatus',255));
        columns.add(DataSource.Column.text('brand',255));
        columns.add(DataSource.Column.text('season',255));
        columns.add(DataSource.Column.text('quantity',255));
        columns.add(DataSource.Column.text('inStock',255));
        columns.add(DataSource.Column.text('size',255));
        columns.add(DataSource.Column.text('color',255));
        columns.add(DataSource.Column.text('ExternalId',255));
        columns.add(DataSource.Column.url('DisplayUrl'));
        tables.add(DataSource.Table.get('Hyperledger_Inventory','title',
            columns));
        return tables;
    }



/**     *   Helper method to parse the data.
     *   The url argument is the URL of the external system.
     *   Returns a list of rows from the external system.
     **/
    public List<Map<String, Object>> getData(String url) {
        String response = getResponse(url);

        // Standardize response string
        if (!response.contains('"items":')) {
            if (response.substring(0,1).equals('{')) {
                response = '[' + response  + ']';
            }
            response = '{"items": ' + response + '}';
        }

        List<Map<String, Object>> rows =
                new List<Map<String, Object>>();

        Map<String, Object> responseBodyMap = (Map<String, Object>)
                JSON.deserializeUntyped(response);

        /**
         *   Checks errors.
         **/
        Map<String, Object> error =
                (Map<String, Object>)responseBodyMap.get('error');
        if (error!=null) {
            List<Object> errorsList =
                    (List<Object>)error.get('errors');
            Map<String, Object> errors =
                    (Map<String, Object>)errorsList[0];
            String errorMessage = (String)errors.get('message');
            throw new 
                    DataSource.OAuthTokenExpiredException(errorMessage);
        }

        List<Object> fileItems = 
            (List<Object>)responseBodyMap.get('items');
        if (fileItems != null) {
            for (Integer i=0; i < fileItems.size(); i++) {
                Map<String, Object> item =
                        (Map<String, Object>)fileItems[i];
                rows.add(createRow(item));
            }
        } else {
            rows.add(createRow(responseBodyMap));
        }

        return rows;
    }
    
    /**
     *   Helper method to map column names.
     **/
    @TestVisible
    private String mapColumnName(String apexName) {
        if (apexName.equalsIgnoreCase('$class'))
            return '$class';
        if (apexName.equalsIgnoreCase('ProductName'))
            return 'ProductName';
        if (apexName.equalsIgnoreCase('SKU'))
            return 'SKU';
        if (apexName.equalsIgnoreCase('Type'))
            return 'Type';
        if (apexName.equalsIgnoreCase('Classification'))
            return 'Classification';
        if (apexName.equalsIgnoreCase('Season'))
            return 'Season';
        if (apexName.equalsIgnoreCase('Brand'))
            return 'Brand';
        if (apexName.equalsIgnoreCase('Quantity'))
            return 'Quantity';
        if (apexName.equalsIgnoreCase('inStock'))
            return 'inStock';
        if (apexName.equalsIgnoreCase('size'))
            return 'size';
        if (apexName.equalsIgnoreCase('color'))
            return 'color';
        if (apexName.equalsIgnoreCase('ExternalId'))
            return 'blockchainId';
        if (apexName.equalsIgnoreCase('DisplayUrl'))
            return 'Id';
        return apexName;
    }

  public Map<String, Object> createRow(
            Map<String, Object> item){
        Map<String, Object> row = new Map<String, Object>();
        for ( String key : item.keySet() ) {
            if (key == 'blockchainId') {
                row.put('ExternalId', item.get(key));
            }

            row.put(key, item.get(key));
        }
        return row;
    }

    /**
     *   Helper method to make the HTTP GET call.
     *   The url argument is the URL of the external system.
     *   Returns the response from the external system.
     **/
    public String getResponse(String url) {
        // Perform callouts for production (non-test) results.
        url = 'callout:CPQ' + '/api/Product';
        Http httpProtocol = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndPoint(url);
        request.setMethod('GET');
        HttpResponse response = httpProtocol.send(request);
        return response.getBody();
    }
}