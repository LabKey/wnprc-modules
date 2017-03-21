package org.labkey.wnprc_compliance.lookups;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Don't change the names of these items!  The database stores the name of the enum value in fields.  In this case,
 * it is stored in wnprc_compliance.animals_per_protocol.  If you need to change something about the keys, use properties
 * to add a getDisplayName() or similar.
 */
public enum SpeciesClass {
    RHESUS_MACAQUE (Species.RHESUS_MACAQUE),
    CYNOMOLGUS_MACAQUE (Species.CYNOMOLGUS_MACAQUE),
    COMMON_MARMOSET (Species.COMMON_MARMOSET),
    MACAQUE (Arrays.asList(Species.RHESUS_MACAQUE, Species.CYNOMOLGUS_MACAQUE))
    ;

    List<Species> species = new ArrayList<>();

    SpeciesClass(Species species) {
        this.species.add(species);
    }

    SpeciesClass(List<Species> speciesList) {
        this.species.addAll(speciesList);
    }
}
