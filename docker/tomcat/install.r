install.packages('devtools', repos='http://cran.us.r-project.org')
install.packages('quadprog', repos='http://cran.us.r-project.org')
install.packages('pedigree', repos='http://cran.us.r-project.org')
install.packages('Matrix',   repos='http://cran.us.r-project.org')
install.packages('RCurl',    repos='http://cran.us.r-project.org')
install.packages('kinship2', repos='http://cran.us.r-project.org')
install.packages('getopt',   repos='http://cran.us.r-project.org')
install.packages('rjson',    repos='http://cran.us.r-project.org')

require('remotes')
install_version('Rlabkey', version='2.1.136', repos='http://cran.us.r-project.org')

require('remotes')
install_github("luansheng/visPedigree")
