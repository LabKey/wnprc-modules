n <- max(parallel::detectCores() - 2L, 1L)
print(n)
#options(Ncpus=n)
install.packages('remotes', repos='http://cran.us.r-project.org')
install.packages(c('devtools','quadprog','pedigree','Matrix', 'RCurl','kinship2','getopt', 'rjson','dplyr','Rlabkey'), repos='http://cran.us.r-project.org')

require('remotes')
install_github("luansheng/visPedigree")
