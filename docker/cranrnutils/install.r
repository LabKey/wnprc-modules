n <- max(parallel::detectCores() - 2L, 1L)
print(n)
#options(Ncpus=n)

install.packages(c('devtools','quadprog','pedigree','Matrix', 'RCurl','kinship2','getopt', 'rjson','dplyr','remotes','Rlabkey'), repos='http://cran.us.r-project.org')

require('remotes')
install_github("luansheng/visPedigree")
