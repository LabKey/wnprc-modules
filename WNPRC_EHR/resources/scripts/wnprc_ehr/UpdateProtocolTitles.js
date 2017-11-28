const LABKEY = require("labkey");

exports.exec = function () {
    LABKEY.Query.selectRows({ schemaName: 'ehr', queryName: 'protocol', columns: ['protocol','title'],
        success: function(data) {
            var store = new LABKEY.ext4.ArrayStore({
            });
            store.load
        }
    });
};

function onFailure(errorInfo, options, responseObj)
{
    if (errorInfo && errorInfo.exception)
        alert("Failure: " + errorInfo.exception);
    else
        alert("Failure: " + responseObj.statusText);
}

function onSuccess(data)
{
    // alert("Success! " + data.rowCount + " rows returned.");
    var confirm = window.confirm("Do you want to update " + data.rowCount + " ?");

    if (data && data.rows && data.rows.length && confirm)
    {
        console.log(data.rows.length + '  number of records to be updated');
        var row;
        for (var idx = 0; idx < data.rows.length; idx++)
        {
            row = data.rows[idx];
            var correctStoreid = 'Tissue Samples';

            var obj = {rowid: row.rowid, storeid: correctStoreid};
            //update section comment for not altering rows
            /*LABKEY.Query.updateRows({
                schemaName:'ehr',
                queryName:'formtemplaterecords',
                rows:[obj],
                success:function(data){
                    console.log(idx+ ' changed storeid');
                },
                failure: function(data){
                    console.log ('Cannot update');
                }

            });*/
        }
    }
    else
    {
        console.log('Did not update');
    }
}

//var filterArray = [LABKEY.Filter.create('lsid', LABKEY.ActionURL.getParameter('lsid'), LABKEY.Filter.Types.EQUAL)];

LABKEY.Query.selectRows({
    schemaName: 'ehr',
    queryName: 'formtemplaterecords',
    columns: ['rowid', 'templateid.title', 'storeid'],
    filterArray: [LABKEY.Filter.create('templateid', 'fb1de209-f39f-1033-8607-f528764d6e44', LABKEY.Filter.Types.EQUAL),
        LABKEY.Filter.create('storeid', 'study||Tissue Samples||||', LABKEY.Filter.Types.EQUAL)],
    //LABKEY.Filter.create('code/code', 'f-61b25', LABKEY.Filter.Types.EQUAL),
    //LABKEY.Filter.create('project','20140501',LABKEY.Filter.Types.EQUAL)],
    success: onSuccess,
    failure: onFailure
});

function executeCustomJavascript() {

    var updated = [
        {protocol:"G005021",title:"SIV/SHIV challenge of alloimmunized cynomolgus macaques",approve:"2017/10/05"},
        {protocol:"G005022",title:"Use of Herpesviruses as Vaccine Vectors for AIDS",approve:"2017/10/11"},
        {protocol:"G005028",title:"Metabolic Engineering of Bacteria for Cancer Immunotherapy by Gamma Delta T Cells",approve:"2014/12/04"},
        {protocol:"G005030",title:"Hypothermia to prevent neurotoxic side effects of pediatric drugs",approve:"2015/02/03"},
        {protocol:"G005044",title:"Marmoset Assisted Reproductive Technologies",approve:"2014/12/15"},
        {protocol:"G005045",title:"Therapeutic use of an enhanced form of CD4-Ig",approve:"2014/12/22"},
        {protocol:"G005050",title:"Studies of Myelination",approve:"2015/01/09"},
        {protocol:"G005052",title:"Neuroinflammatory pathways in primary astrocyte disease",approve:"2014/12/29"},
        {protocol:"G005061",title:"A Nonhuman Primate Model of Infection-Induced Pregnancy Loss",approve:"2014/12/16"},
        {protocol:"G005066",title:"A radiometabolism study of hair hormones in the Rhesus Macaque",approve:"2015/02/23"},
        {protocol:"G005067",title:"Primate model of traumatic spinal cord injury",approve:"2015/02/05"},
        {protocol:"G005080",title:"Does infectious HIV-1 trapped on follicular dendritic cells represent a long-term reservoir?",approve:"2015/02/23"},
        {protocol:"G005088",title:"Isolation of SIV neutralizing antibodies from non-human primates after immunization.",approve:"2015/03/16"},
        {protocol:"G005091",title:""Preliminary screening of animals for research projects conducted under the supervision of SPI (Scientific Protocol Implementation), WNPRC",approve:"2015/03/13"},
    {protocol:"G005094",title:"Priming Protective CD8 T-Cell Memory in the Lung ",approve:"2015/03/06"},
    {protocol:"G005097",title:"Adverse pregnancy outcomes in a nonhuman primate model",approve:"2015/03/24"},
    {protocol:"G005101",title:"Glaucoma Studies in Non-human Primates",approve:"2015/04/16"},
    {protocol:"G005108",title:"Dopaminergic IPS Transplants to MPTP-treated Monkeys",approve:"2015/04/30"},
    {protocol:"G005109",title:"The role of ADCC (Antibody Dependent Cell Cytotoxicity) in antibody protection against mucosal SHIV challenge.",approve:"2015/05/27"},
    {protocol:"G005113",title:"Evaluation of in vivo correlates of protection to Human Immunodeficiency Virus (HIV) in Simian Immunodeficiency Virus (SIV) infected macaques.",approve:"2015/04/28"},
    {protocol:"G005136",title:"Inducible Gene Expression in Transgenic Mice",approve:"2015/05/12"},
    {protocol:"G005141",title:"Fcgamma receptor-mediated suppression of immunodeficiency virus replication",approve:"2015/05/27"},
    {protocol:"G005145",title:""Yellow Fever",approve:" rRRV"," rVSV and rVV as Vectors for AIDS Vaccine Development"","CAPUANO","2015/05/07"},
    {protocol:"G005150",title:"Magnetic Resonance Imaging of Transient Cerebral Ischemia",approve:"2015/06/22"},
    {protocol:"G005151",title:"WNPRC Terminal Tissue and Biological Sample Collection",approve:"2015/06/17"},
    {protocol:"G005153",title:"Chemogenetic modulation of the subthalamic region to rescue motor deficits in hemiparkinsonian rhesus macaques",approve:"2015/09/29"},
    {protocol:"G005154",title:"Control of GnRH neurons and puberty",approve:"2015/07/23"},
    {protocol:"G005158",title:"Presbyopia Studies in Non-human Primates",approve:"2015/06/10"},
    {protocol:"G005169",title:"Transplantation of human induced pluripotent stem to study developmental disorders",approve:"2015/06/25"},
    {protocol:"G005172",title:"Nonhuman primate embryology and development: CCR5 genomic editing",approve:"2015/06/05"},
    {protocol:"G005181",title:"The Role of G alpha z signaling on Beta-Cell Function and Mass",approve:"2015/06/18"},
    {protocol:"G005187",title:"GFAP knockdown in mouse models of Alexander disease",approve:"2015/06/25"},
    {protocol:"G005188",title:"Identification of the mechanisms of obesity-associated breast cancer",approve:"2015/06/18"},
    {protocol:"G005192",title:"Quantitative Ultrasound: A Novel Approach to Assessing the Pregnant Cervix",approve:"2015/06/22"},
    {protocol:"G005201",title:"Mammary Prolactin Production and Breast Cancer",approve:"2015/07/23"},
    {protocol:"G005208",title:"Neurobehavioral development and assessment of normal and transgenic common marmosets",approve:"2015/07/23"},
    {protocol:"G005211",title:"Function of TFG in neuronal maintenance",approve:"2015/06/29"},
    {protocol:"G005229",title:"Neural processing of orientation and position in rhesus macaques",approve:"2015/07/30"},
    {protocol:"G005234",title:"Determining specificity of estrogen action in female marmosets",approve:"2015/10/27"},
    {protocol:"G005236",title:"Development of oxygen pre-breathe schedules for submarine escape and rescue.",approve:"2015/12/21"},
    {protocol:"G005246",title:"WNPRC Macaque Breeding Colony",approve:"2015/08/03"},
    {protocol:"G005248",title:"Vaccination of Mamu-B*17 allele positive animals to enhance frequency of elite control",approve:"2015/11/11"},
    {protocol:"G005261",title:"Host Immune Responses to SIV in Rhesus Macaques",approve:"2015/09/02"},
    {protocol:"G005263",title:"Imaging the maternal-fetal interface in adverse pregnancy outcomes",approve:"2015/08/31"},
    {protocol:"G005267",title:"Pathologic Evaluation of Laboratory Animals and Phenotypic Evaluation",approve:"2015/10/11"},
    {protocol:"G005269",title:"Evaluation of Dengue vaccination and challenge viruses in nonhuman primates ",approve:"2015/09/08"},
    {protocol:"G005273",title:"Primate Center Colony Resource",approve:"2015/09/09"},
    {protocol:"G005281",title:"Laboratory Animal Training and Teaching Protocol ",approve:"2015/10/26"},
    {protocol:"G005291",title:"The Role of Outer Retinal Injury in Glaucoma",approve:"2015/12/14"},
    {protocol:"G005296",title:"Evidence-based behavioral evaluation of enrichment strategies",approve:"2015/10/29"},
    {protocol:"G005300",title:"Stem Cell Development and Function in the Animal Brain ",approve:"2015/11/11"},
    {protocol:"G005306",title:"Mouse colony maintenance and primary tissue generation",approve:"2015/11/24"},
    {protocol:"G005307",title:"Therapeutic vaccination targeting SIV viral reservoirs",approve:"2015/12/13"},
    {protocol:"G005309",title:""Restraint",approve:"JOHNSON","2015/12/03"},
        {protocol:"G005312",title:"Tetherin supplement protocol",approve:"2015/11/30"},
        {protocol:"G005315",title:"Epigenetic regulation of brain functions",approve:"2015/11/18"},
        {protocol:"G005325",title:""Metabolic effects of AdipoRon",approve:"COLMAN","2015/12/03"},
            {protocol:"G005330",title:"Delivery of Small Interfering RNA to Primates",approve:"2015/12/07"},
            {protocol:"G005334",title:"Impact of Exercise on Sarcopenia",approve:"2015/12/29"},
            {protocol:"G005339",title:"Stem Cell Transplantation in Animal Models of Spinal Cord Diseases",approve:"2016/01/06"},
            {protocol:"G005341",title:"Stem Cell Transplantation in Animal Models of Neurodegenerative Diseases",approve:"2016/01/26"},
            {protocol:"G005346",title:"Circulation of pre-eclampsia therapeutics in primate placenta",approve:"2016/01/12"},
            {protocol:"G005354",title:"Neurobiology of GFAP mutant rats",approve:"2015/12/21"},
            {protocol:"G005362",title:"Tomotherapy and hematopoietic stem cells for tolerance to kidney transplants",approve:"2016/01/25"},
            {protocol:"G005366",title:"Primate Ocular Disease",approve:"2016/02/08"},
            {protocol:"G005370",title:"Analysis of normal murine ocular gene expression.",approve:"2016/01/08"},
            {protocol:"G005373",title:"Rodent Models Core Behavior Testing",approve:"2016/02/26"},
            {protocol:"G005379",title:"Impact of external stimuli on neuronal development",approve:"2016/02/15"},
            {protocol:"G005386",title:"Transient cytoskeletal arrays",approve:"2016/03/07"},
            {protocol:"G005396",title:"Gene-environment interactions in craniofacial birth defects",approve:"2016/01/29"},
            {protocol:"G005401",title:"Defining South American Zika virus susceptibility and pathogenicity in adult and neonatal nonhuman primates",approve:"2016/02/09"},
            {protocol:"G005422",title:"Mouse models to study neurodevelopmental disorders",approve:"2016/03/01"},
            {protocol:"G005424",title:"Hematopoietic stem cell treatment of SHIV infected Mauritian cynomolgus macaques",approve:"2016/04/08"},
            {protocol:"G005427",title:"Diet switch experiment to track inflection points of amino acid enrichment dynamics using 15N:",approve:"2016/03/07"},
            {protocol:"G005430",title:"Stem cell research for neurodegenerative and neuromuscular diseases",approve:"2016/04/05"},
            {protocol:"G005431",title:"Marmoset health and nutrition",approve:"2016/03/03"},
            {protocol:"G005435",title:"Titration of SIV in vivo",approve:"2016/03/28"},
            {protocol:"G005443",title:"Investigating mechanisms of GB virus C protection from AIDS in macaques.",approve:"2016/04/18"},
            {protocol:"G005446",title:"The Study of the Neuroendocrine Hypothalamus",approve:"2016/04/01"},
            {protocol:"G005449",title:"Refine Cell Therapy Outcomes by Remote Regulation of Neural Circuitry in Non-Human Primates ",approve:"2016/04/01"},
            {protocol:"G005462",title:"Nonhuman primates as blood sample donors for in vitro research projects.",approve:"2016/05/17"},
            {protocol:"G005466",title:"Antibody-microbicide mucosal retention kinetics.",approve:"2016/04/15"},
            {protocol:"G005468",title:"Transgenic and Gene-Targeted Mouse Production",approve:"2016/04/20"},
            {protocol:"G005469",title:"Dietary fat ratio's influence on adolescent depression",approve:"2016/04/05"},
            {protocol:"G005475",title:"Evaluation of Pathogen Specific Cytotoxic T-Lymphocytes (CTL) in Macaques",approve:"2016/07/05"},
            {protocol:"G005493",title:"Interventional strategies to counter the effects of brain-death on organ quality and function in non-human primates.",approve:"2016/06/13"},
            {protocol:"G005496",title:"KIR and MHC class I Immunogenetics in SIV infection",approve:"2016/06/02"},
            {protocol:"G005507",title:"Host Immune Responses that Contribute to Control of Attenuated SIV in macaques",approve:"2016/06/17"},
            {protocol:"G005513",title:"Lentiviral Resistance to Tetherin",approve:"2016/06/06"},
            {protocol:"G005529",title:"CTL Exclusion from Lymphoid Follicles as a Mechanism of Lentivirus Immune Evasion",approve:"2016/06/30"},
            {protocol:"G005533",title:"Breeding Colony Management in Marmosets",approve:"2016/07/05"},
            {protocol:"G005536",title:"Evaluation of IPX750 antiparkinsonian properties",approve:"2016/08/02"},
            {protocol:"G005539",title:"Influences of dietary properties on chewing patterns in primates",approve:"2016/07/15"},
            {protocol:"G005545",title:"Role of Estrogen Receptor Alpha (ER) in Neonatal Mice after Hypoxia Ischemia",approve:"2016/07/22"},
            {protocol:"G005548",title:"Assessment of the pharmacokinetic characteristics of human C1 inhibitor",approve:"2016/09/16"},
            {protocol:"G005549",title:"Control of ZIKV viremia with neutralizing antibody.",approve:"2016/07/18"},
            {protocol:"G005553",title:"Impact of SIV Infection on the Function of Mucosal Associated Invariant T (MAIT) cells ",approve:"2016/06/23"},
            {protocol:"G005560",title:"Regulation of gonad development ",approve:"2016/08/03"},
            {protocol:"G005563",title:"Ipilimumab as an adjuvant for HIV vaccines",approve:"2016/07/25"},
            {protocol:"G005565",title:"Enhanced Lymphocyte Infusions to Engineer Viral Eradication",approve:"2016/07/12"},
            {protocol:"G005568",title:"Transgenic Neurobiology of the Mouse",approve:"2016/08/09"},
            {protocol:"G005592",title:"Macaque Assisted Reproductive Technologies.",approve:"2016/08/29"},
            {protocol:"G005604",title:"Induction of microbial translocation in macaques",approve:"2016/09/20"},
            {protocol:"G005608",title:"GFAP knockdown in rat models of Alexander disease",approve:"2016/09/01"},
            {protocol:"G005609",title:"Evaluation of CD4 mimetic compounds in rhesus macaques",approve:"2016/12/10"},
            {protocol:"G005623",title:"Generation of MHC-binding antibodies in macaques",approve:"2016/10/27"},
            {protocol:"G005635",title:"Efficacy of a therapeutic on Zika virus infection",approve:"2016/10/23"},
            {protocol:"G005640",title:"Role of sex steroids and kisspeptin in the regulation of GnRH release",approve:"2016/10/04"},
            {protocol:"G005649",title:""Preliminary drug testing for bioavailability and safety in nonhuman primates conducted under the supervision of SPI (Scientific Protocol Implementation), WNPRC",approve:"2016/10/26"},
                {protocol:"G005651",title:"Vascular abnormalities after experimental spinal cord injury",approve:"2016/11/20"},
                {protocol:"G005652",title:"Neuroinflammation in pediatric brain injury",approve:"2016/10/20"},
                {protocol:"G005654",title:"Can CD8+ T cells prevent systemic SIV infection?",approve:"2016/12/14"},
                {protocol:"G005656",title:"Use of recombinant adeno-associated virus vector to deliver antibodies and antibody-like molecules for the prevention or treatment of SIV or SHIV infection in monkeys",approve:"2016/11/14"},
                {protocol:"G005662",title:"Macaque Aging Colony",approve:"2016/12/01"},
                {protocol:"G005689",title:"Waisman Center Rodent Facility - Transgenic and Reproductive Services",approve:"2016/12/14"},
                {protocol:"G005691",title:"Zika Virus and the Non-Human Primate Maternal/Fetal Interface ",approve:"2017/02/05"},
                {protocol:"G005698",title:"Nonhuman Primate Bone Marrow Transplantation Model",approve:"2016/12/16"},
                {protocol:"G005721",title:"Intraocular transplantation of differentiated human pluripotent stem cells to treat retinal degenerative disease",approve:"2017/01/20"},
                {protocol:"G005722",title:"Effects of aging on lower urinary tract function",approve:"2017/01/10"},
                {protocol:"G005725",title:"Effects of Early Experience on the Development of Anxiety and its Neural Substrate",approve:"2017/02/22"},
                {protocol:"G005726",title:"Caloric restriction and aging",approve:"2017/01/11"},
                {protocol:"G005736",title:"Estrogen and progesterone receptor involvement in polycystic ovary syndrome pathogenesis",approve:"2017/02/08"},
                {protocol:"G005740",title:"Molecular Regulation of Neurogenesis: Breeding Colony",approve:"2017/02/07"},
                {protocol:"G005741",title:"Molecular Regulation of Neurogenesis: Experimental Protocol",approve:"2017/02/07"},
                {protocol:"G005744",title:"Treatment strategies to improve organ quality and function in the post-transplant period",approve:"2017/04/07"},
                {protocol:"G005751",title:"Colony Management of Research Mice",approve:"2017/01/25"},
                {protocol:"G005765",title:"A novel HIV-1 vaccine targeting the 12 protease cleavage sites",approve:"2017/02/13"},
                {protocol:"G005777",title:"Electrophysiology and neuroimaging of cognition in macaques",approve:"2017/03/08"},
                {protocol:"G005800",title:"Effect of senescent cell clearance on aging and metabolic phenotypes in monkeys",approve:"2017/04/09"},
                {protocol:"G005807",title:"Cardio/Vascular transplant models in Mauritian Cynomolgus Macaques",approve:"2017/05/31"},
                {protocol:"G005809",title:"Neural Circuitry of Emotion",approve:"2017/05/31"},
                {protocol:"G005841",title:"Expanding the applicability of the AAV-Mediated Delivery of Antibodies Approach against HIV.",approve:"2017/07/27"},
                {protocol:"G005843",title:"Preclinical development of HIV-1 Vif antagonists",approve:"2017/05/22"},
                {protocol:"G005876",title:"Investigation of a prophylactic and therapeutic vaccine for Kaposi's Sarcoma ",approve:"2017/08/02"},
                {protocol:"G005881",title:"Sensorimotor integration in the behaving primate",approve:"2017/08/01"},
                {protocol:"G005888",title:"Rapid Suppression of IgE-Mediated Allergy",approve:"2017/07/28"},
                {protocol:"G005908",title:"Suppressing the latent reservoir with a Tat inhibitor",approve:"2017/09/22"},
                {protocol:"G005924",title:"Neural mechanisms of visual perception and visually guided behavior",approve:"2017/10/06"},
                {protocol:"G005928",title:"Zika Virus and Male Reproductive Physiology",approve:"2017/11/12"}
            ];

                LABKEY.Query.selectRows({ schemaName: 'ehr', queryName: 'protocol', sort: 'protocol',
                    success: function(data) {

                        data = data || {};
                        data.rows = data.rows || [];

                        var toUpdate = [];
                        for (var i=0, j=0; i<updated.length && j<data.rows.length; i++) {
                            if (updated[i].protocol == data.rows[j].protocol) {
                                toUpdate.push(updated[i]);
                                j++;
                            }
                        }

                        for (var i=0; i<toUpdate.length; i++) {
                            $("#js-content table").append($("<tr/>")
                                    .append($("<td/>", {'style': 'border: solid 1px black'})
                                            .append(toUpdate[i].protocol))
                                    .append($("<td/>", {'style': 'border: solid 1px black'})
                                            .append(toUpdate[i].approve))
                                    .append($("<td/>", {'style': 'border: solid 1px black'})
                                            .append(toUpdate[i].title)));
                        }
                    }
                });
            }