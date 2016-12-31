##
#  Copyright (c) 2010 LabKey Corporation
# 
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##
#options(echo=TRUE);
library(lattice);

labkey.data$date = as.Date(labkey.data$date);

size = length(unique(labkey.data$id));

png(filename="${imgout:graph.png}",
    width=800,
    height=(400 * size)
    );

#par(mfrow=c(size,3),
#    mar=c(4, 8, 4, 4)
#    );

#legend("bottomright", legend=perAnimalRows$animal[1], cex=2);

xyplot(weight ~ date | id,
    data=labkey.data,
    #type="o",
    layout=c(1,size),
    xlab="Date",
    #type="cairo",
    ylab="Weight (kg)",
    scales=list(x=list(relation="free", tick.number=10)),
    par.settings = list(strip.background = list(col = c("light grey")) ) 
    );
#minor.tick(nx=10);

dev.off();