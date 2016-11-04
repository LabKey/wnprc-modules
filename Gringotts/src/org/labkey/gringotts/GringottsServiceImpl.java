package org.labkey.gringotts;

import org.labkey.api.data.CompareType;
import org.labkey.api.data.Table;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.security.User;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.gringotts.annotation.AnnotationUtil;
import org.labkey.gringotts.api.GringottsService;
import org.labkey.gringotts.api.annotation.VaultInfo;
import org.labkey.gringotts.api.model.Vault;
import org.labkey.gringotts.model.VaultImpl;
import org.labkey.gringotts.model.raw.VaultRow;

/**
 * Created by jon on 10/19/16.
 */
public class GringottsServiceImpl extends GringottsService {
    @Override
    public Vault createVault(User user, Class clazz) {
        VaultInfo vaultInfo = AnnotationUtil.getVaultInfo(clazz);

        // Panic if the class isn't a Vault
        if (vaultInfo == null) {
            throw new RuntimeException("Vaults need to implement the annotation @VaultInfo");
        }

        VaultRow vaultRecord = new VaultRow(vaultInfo.name());
        Table.insert(user, GringottsSchema.getInstance().getVaultTableInfo(), vaultRecord);

        return null;
    }

    @Override
    public Vault getVault(User user, Class clazz) {
        VaultInfo vaultInfo = AnnotationUtil.getVaultInfo(clazz);

        // Panic if the class isn't a Vault
        if (vaultInfo == null) {
            throw new RuntimeException("Vaults need to implement the annotation @VaultInfo");
        }

        SimplerFilter filter = new SimplerFilter("vaultname", CompareType.EQUAL, vaultInfo.name());
        VaultRow vaultRow = new TableSelector(getVaultTableInfo()).getObject(filter, VaultRow.class);

        if (vaultRow == null) {
            return null;
        }

        return new VaultImpl(vaultRow, clazz);
    }

    private TableInfo getVaultTableInfo() {
        return GringottsSchema.getInstance().getVaultTableInfo();
    }
}
