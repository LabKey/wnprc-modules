##
#  Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
# 
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
# 
#      http://www.apache.org/licenses/LICENSE-2.0
# 
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
##
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
