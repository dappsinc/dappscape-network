// Dapps Incorporated 2020. All Rights Reserved.

@isTest
public class HyperledgerAccountProviderTest {

    @isTest
    public static void testAll(){
        HyperledgerAccountProvider obj = new HyperledgerAccountProvider();
        obj.getAuthenticationCapabilities();
        obj.getCapabilities();
        
        obj.getConnection(null);
    }
}