n <- max(parallel::detectCores() - 2L, 1L)
print(n)
#options(Ncpus=n)
install.packages('remotes', 
                  quiet = FALSE, 
                  verbose = TRUE)
install.packages(c('devtools','quadprog','pedigree','Matrix', 'RCurl','kinship2','getopt', 'rjson','dplyr','Rlabkey'), 
                  quiet = FALSE, 
                  verbose = TRUE, 
                  Ncpus=n,
                  repos='http://cran.us.r-project.org')
require('remotes')
install_github("luansheng/visPedigree")
